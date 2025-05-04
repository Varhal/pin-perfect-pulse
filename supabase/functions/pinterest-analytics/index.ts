import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/**
 * Refreshes the Pinterest OAuth token
 * @param supabaseClient - Supabase client
 * @param accountId - Pinterest account ID
 * @param refreshToken - Pinterest API refresh token
 * @param appId - Pinterest App ID
 * @param appSecret - Pinterest App Secret
 * @returns New access token and refresh token
 */
async function refreshPinterestToken(
  supabaseClient: any,
  accountId: string,
  refreshToken: string,
  appId: string,
  appSecret: string,
) {
  try {
    console.log(`Refreshing token for account: ${accountId}`);
    // Pinterest OAuth2 token endpoint
    const tokenEndpoint = 'https://api.pinterest.com/v5/oauth/token';
    if (!appSecret) {
      throw new Error('App secret is required for token refresh');
    }
    // Base64 encode app_id:app_secret for Basic auth
    const basicAuth = btoa(`${appId}:${appSecret}`);
    // Prepare request for token refresh
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error:', errorData);
      throw new Error(
        `Pinterest token refresh failed: ${response.status} - ${errorData.message}`,
      ); // Include error message
    }
    const tokenData = await response.json();
    // Update the tokens in the database
    const { error: updateError } = await supabaseClient
      .from('pinterest_accounts')
      .update({
        api_key: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);
    if (updateError) {
      console.error('Error updating tokens in database:', updateError);
      throw new Error('Failed to update tokens in database');
    }
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };
  } catch (error: any) {
    console.error('Error refreshing Pinterest token:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

/**
 * Gets analytics data for a Pinterest account.
 * @param req - HTTP request object.
 * @param supabaseClient - Supabase client for database interaction.
 * @param accountId - Pinterest account ID.
 * @param accessToken - Pinterest API access token.
 * @param adAccountId - Pinterest Ad Account ID.
 * @param dateRange - Object with start and end dates for analysis.
 * @returns Analytics data in JSON format.
 */
async function getAnalyticsData(
  req: Request,
  supabaseClient: any,
  accountId: string,
  accessToken: string,
  adAccountId: string,
  dateRange: { startDate?: string; endDate?: string } | undefined,
) {
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${adAccountId}/analytics`;
  const apiParams = {
    start_date: dateRange?.startDate || getDefaultStartDate(),
    end_date: dateRange?.endDate || getCurrentDate(),
    granularity: 'DAY',
    metrics: [
      'IMPRESSION',
      'ENGAGEMENT',
      'PIN_CLICK',
      'OUTBOUND_CLICK',
      'SAVE',
      'TOTAL_AUDIENCE',
      'ENGAGED_AUDIENCE',
    ].join(','),
    report_attribution_type: 'ORGANIC',
  };
  const urlParams = new URLSearchParams(apiParams);
  const finalUrl = `${apiUrl}?${urlParams.toString()}`;
  try {
    console.log(`Making Pinterest API request to: ${finalUrl}`);
    console.log(`Using token: ${accessToken.substring(0, 10)}...`);
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinterest API error:', errorData);
      // Check if this is an authentication error and could be fixed with a new token
      if (response.status === 401) {
        throw new Error('Authentication failed with Pinterest API');
      }
      throw new Error(
        `Pinterest API error: ${response.status} - ${errorData.message}`,
      ); // Include error message
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error in getAnalyticsData: ${error.message}`);
    throw error; // Re-throw the error
  }
}

/**
 * Gets audience data for a Pinterest account.
 * @param req - HTTP request object.
 * @param supabaseClient - Supabase client for database interaction.
 * @param accountId - Pinterest account ID.
 * @param accessToken - Pinterest API access token.
 * @param adAccountId - Pinterest Ad Account ID.
 * @returns Audience data in JSON format.
 */
async function getAudienceData(
  req: Request,
  supabaseClient: any,
  accountId: string,
  accessToken: string,
  adAccountId: string,
) {
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${adAccountId}/audience_insights/interests`;
  const apiParams = {
    audience_type: 'ENGAGED',
    format: 'PERCENTAGE',
  };
  const urlParams = new URLSearchParams(apiParams);
  const finalUrl = `${apiUrl}?${urlParams.toString()}`;
  try {
    console.log(`Making Pinterest API request to: ${finalUrl}`);
    console.log(`Using token: ${accessToken.substring(0, 10)}...`);
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinterest API error:', errorData);
      throw new Error(
        `Pinterest API error: ${response.status} - ${errorData.message}`,
      ); // Include error message
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error in getAudienceData: ${error.message}`);
    throw error; // Re-throw the error
  }
}

/**
 * Gets profile data for a Pinterest user.
 * @param req - HTTP request object.
 * @param supabaseClient - Supabase client for database interaction.
 * @param accessToken - Pinterest API access token.
 * @returns User profile data in JSON format.
 */
async function getProfileData(
  req: Request,
  supabaseClient: any,
  accessToken: string,
) {
  const apiUrl = `https://api.pinterest.com/v5/users/me`;
  try {
    console.log(`Making Pinterest API request to: ${apiUrl}`);
    console.log(`Using token: ${accessToken.substring(0, 10)}...`);
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinterest API error:', errorData);
      throw new Error(
        `Pinterest API error: ${response.status} - ${errorData.message}`,
      ); // Include error message
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error in getProfileData: ${error.message}`);
    throw error; // Re-throw the error
  }
}

/**
 * Check if token needs to be refreshed
 * @param tokenExpiresAt ISO date string when token expires
 * @returns boolean indicating if token needs refresh
 */
function tokenNeedsRefresh(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return true;
  // Add 10 minute buffer to expiration time
  const expiryDate = new Date(tokenExpiresAt).getTime();
  const now = Date.now();
  const tenMinutesInMs = 10 * 60 * 1000;
  return now + tenMinutesInMs >= expiryDate;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    // Parse request body
    const { accountId, endpoint, dateRange } = await req.json();
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    // Fetch the account data from Supabase
    const { data: accountData, error: accountError } = await supabaseClient
      .from('pinterest_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();
    if (accountError || !accountData) {
      throw new Error('Pinterest account not found');
    }
    // Get access token and other credentials from the account data
    let accessToken = accountData.api_key;
    let refreshToken = accountData.refresh_token;
    const appId = accountData.app_id;
    const appSecret = accountData.app_secret;
    const tokenExpiresAt = accountData.token_expires_at;
    const adAccountId = accountData.ad_account_id || appId; // Use ad_account_id if available, else fallback to app_id
    // Check if token needs refreshing and we have the necessary credentials
    if (tokenNeedsRefresh(tokenExpiresAt)) {
      console.log('Token needs refreshing');
      if (refreshToken && appSecret) {
        try {
          console.log('Attempting to refresh token with credentials');
          const newTokens = await refreshPinterestToken(
            supabaseClient,
            accountId,
            refreshToken,
            appId,
            appSecret,
          );
          accessToken = newTokens.accessToken;
          refreshToken = newTokens.refreshToken;
          // Update the token_expires_at as well
          const { error: updateError } = await supabaseClient
            .from('pinterest_accounts')
            .update({
              api_key: accessToken,
              refresh_token: refreshToken,
              token_expires_at: new Date(
                Date.now() + 3600 * 1000,
              ).toISOString(), // Example: 1 hour expiration
              updated_at: new Date().toISOString(),
            })
            .eq('id', accountId);
          if (updateError) {
            console.error(
              'Error updating refresh token expiration in database:',
              updateError,
            );
            // Consider throwing an error here, or logging and continuing
          }
          console.log('Token refreshed successfully');
        } catch (refreshError: any) {
          console.error('Failed to refresh token:', refreshError);
          console.log('Using existing token as fallback');
          // Consider throwing an error here
          // throw new Error("Token refresh failed: " + refreshError.message);
        }
      } else {
        if (!refreshToken) {
          console.warn(
            'No refresh token available, using existing access token',
          );
        }
        if (!appSecret) {
          console.warn('No app secret available for token refresh');
        }
      }
    }
    // Verify we have a token to use
    if (!accessToken) {
      throw new Error('No access token available for Pinterest API');
    }
    // Initialize data variable
    let data;
    try {
      // Determine which endpoint to call
      switch (endpoint) {
        case 'analytics':
          data = await getAnalyticsData(
            req,
            supabaseClient,
            accountId,
            accessToken,
            adAccountId,
            dateRange,
          );
          break;
        case 'audience':
          data = await getAudienceData(
            req,
            supabaseClient,
            accountId,
            accessToken,
            adAccountId,
          );
          break;
        case 'profile':
          data = await getProfileData(
            req,
            supabaseClient,
            accessToken,
          );
          break;
        default:
          throw new Error(`Invalid endpoint: ${endpoint}`);
      }
    } catch (apiError: any) {
      console.error(`API Error: ${apiError.message}`);
      // Return a fallback with error info instead of throwing
      return new Response(
        JSON.stringify({
          error: apiError.message,
          fallback: true,
          message: 'Using mock data due to API error',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }
    // Return the data
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        // Send a specific status code that the frontend can check
        code: 'PINTEREST_API_ERROR',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});

// Helper functions
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

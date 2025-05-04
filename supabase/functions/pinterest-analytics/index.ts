
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Refreshes the Pinterest OAuth token
 * @param supabaseClient - Supabase client
 * @param accountId - Pinterest account ID
 * @param refreshToken - Pinterest API refresh token
 * @param appId - Pinterest App ID
 * @returns New access token and refresh token
 */
async function refreshPinterestToken(
  supabaseClient: any,
  accountId: string,
  refreshToken: string,
  appId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    console.log(`Refreshing token for account: ${accountId}`);
    
    // Pinterest OAuth2 token endpoint
    const tokenEndpoint = 'https://api.pinterest.com/v5/oauth/token';
    
    // Get app secret from database or environment
    // In a real implementation, you should securely store this
    const { data: accountData, error: secretError } = await supabaseClient
      .from('pinterest_accounts')
      .select('app_secret')
      .eq('id', accountId)
      .single();
      
    if (secretError || !accountData) {
      throw new Error('Could not retrieve app secret');
    }
    
    const appSecret = accountData.app_secret;
    
    // Base64 encode app_id:app_secret for Basic auth
    const basicAuth = btoa(`${appId}:${appSecret}`);
    
    // Prepare request for token refresh
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error:', errorData);
      throw new Error(`Pinterest token refresh failed: ${response.status}`);
    }
    
    const tokenData = await response.json();
    
    // Update the tokens in the database
    const { error: updateError } = await supabaseClient
      .from('pinterest_accounts')
      .update({
        api_key: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);
      
    if (updateError) {
      console.error('Error updating tokens in database:', updateError);
      throw new Error('Failed to update tokens in database');
    }
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    };
  } catch (error) {
    console.error('Error refreshing Pinterest token:', error);
    throw error;
  }
}

/**
 * Отримує аналітичні дані для акаунта Pinterest.
 * @param req - Об'єкт HTTP-запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accountId - ID аккаунта Pinterest
 * @param accessToken - Токен доступу Pinterest API.
 * @param appId - ID застосунку Pinterest.
 * @param dateRange - Об'єкт з датами початку та кінця періоду аналізу.
 * @returns Дані аналітики у форматі JSON.
 */
async function getAnalyticsData(
  req: Request,
  supabaseClient: any,
  accountId: string,
  accessToken: string,
  appId: string,
  dateRange: { startDate?: string; endDate?: string } | undefined
) {
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${appId}/analytics`;
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

  const response = await fetch(finalUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Pinterest API error:', errorData);
    throw new Error(`Pinterest API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Отримує дані про аудиторію для акаунта Pinterest.
 * @param req - Об'єкт HTTP-запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accountId - ID аккаунта Pinterest
 * @param accessToken - Токен доступу Pinterest API.
 * @param appId - ID застосунку Pinterest.
 * @returns Дані про аудиторію у форматі JSON.
 */
async function getAudienceData(
  req: Request,
  supabaseClient: any,
  accountId: string,
  accessToken: string,
  appId: string
) {
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${appId}/audience_insights/interests`;
  const apiParams = {
    audience_type: 'ENGAGED',
    format: 'PERCENTAGE',
  };

  const urlParams = new URLSearchParams(apiParams);
  const finalUrl = `${apiUrl}?${urlParams.toString()}`;

  const response = await fetch(finalUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Pinterest API error:', errorData);
    throw new Error(`Pinterest API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Отримує дані профілю користувача Pinterest.
 * @param req - Об'єкт HTTP-запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accessToken - Токен доступу Pinterest API.
 * @returns Дані профілю користувача у форматі JSON.
 */
async function getProfileData(
  req: Request,
  supabaseClient: any,
  accessToken: string
) {
  const apiUrl = `https://api.pinterest.com/v5/users/me`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Pinterest API error:', errorData);
    throw new Error(`Pinterest API error: ${response.status}`);
  }
  return await response.json();
}

/**
 * Check if token needs to be refreshed
 * @param tokenExpiresAt ISO date string when token expires
 * @returns boolean indicating if token needs refresh
 */
function tokenNeedsRefresh(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return true;
  
  // Add 5 minute buffer to expiration time
  const expiryDate = new Date(tokenExpiresAt).getTime();
  const now = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;
  
  return now + fiveMinutesInMs >= expiryDate;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    // Get access token from the account data
    let accessToken = accountData.api_key;
    let refreshToken = accountData.refresh_token;
    const appId = accountData.app_id;
    const tokenExpiresAt = accountData.token_expires_at;

    // Check if token needs refreshing
    if (tokenNeedsRefresh(tokenExpiresAt)) {
      console.log('Token needs refreshing');
      if (refreshToken) {
        try {
          const newTokens = await refreshPinterestToken(supabaseClient, accountId, refreshToken, appId);
          accessToken = newTokens.accessToken;
          refreshToken = newTokens.refreshToken;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Continue with the old token as a fallback
          console.log('Using existing token as fallback');
        }
      } else {
        console.warn('No refresh token available, using existing access token');
      }
    }
    
    let data;

    // Determine which endpoint to call
    switch (endpoint) {
      case 'analytics':
        data = await getAnalyticsData(req, supabaseClient, accountId, accessToken, appId, dateRange);
        break;
      case 'audience':
        data = await getAudienceData(req, supabaseClient, accountId, accessToken, appId);
        break;
      case 'profile':
        data = await getProfileData(req, supabaseClient, accessToken);
        break;
      default:
        throw new Error('Invalid endpoint');
    }

    // Return the data
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
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

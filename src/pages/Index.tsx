import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Отримує аналітичні дані для акаунта Pinterest.
 * @param req - Об'єкт HTTP-запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accessToken - Токен доступу Pinterest API.
 * @param adAccountId - ID рекламного акаунта Pinterest.
 * @param dateRange - Об'єкт з датами початку та кінця періоду аналізу.
 * @returns Дані аналітики у форматі JSON.
 */
async function getAnalyticsData(
  req: Request,
  supabaseClient: any,
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
 * @param accessToken - Токен доступу Pinterest API.
 * @param adAccountId - ID рекламного акаунта Pinterest.
 * @returns Дані про аудиторію у форматі JSON.
 */
async function getAudienceData(
  req: Request,
  supabaseClient: any,
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
  accessToken: string,
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
 * Обробляє HTTP-запит для отримання даних з Pinterest API.
 * @param req - Об'єкт HTTP-запиту.
 */
serve(async (req) => {
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

    // Get access token and ad account ID
    const accessToken = accountData.api_key;
    const adAccountId = accountData.app_id; // Assuming app_id is the ad account ID
    let data;

    // Determine which endpoint to call
    switch (endpoint) {
      case 'analytics':
        data = await getAnalyticsData(req, supabaseClient, accessToken, adAccountId, dateRange);
        break;
      case 'audience':
        data = await getAudienceData(req, supabaseClient, accessToken, adAccountId);
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

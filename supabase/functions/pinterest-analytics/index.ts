
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PinterestApiParams {
  accountId: string;
  endpoint: 'analytics' | 'audience' | 'profile';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Parse request body
    const { accountId, endpoint, dateRange } = await req.json() as PinterestApiParams;
    
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
    
    // Get access token using the account's API key
    const accessToken = accountData.api_key;
    const appId = accountData.app_id;
    
    let apiUrl = '';
    let apiParams = {};
    
    // Determine which endpoint to call
    switch(endpoint) {
      case 'analytics':
        apiUrl = `https://api.pinterest.com/v5/ad_accounts/${appId}/analytics`;
        apiParams = {
          start_date: dateRange?.startDate || getDefaultStartDate(),
          end_date: dateRange?.endDate || getCurrentDate(),
          granularity: 'DAY',
          metrics: ['IMPRESSION', 'ENGAGEMENT', 'PIN_CLICK', 'OUTBOUND_CLICK', 'SAVE', 'TOTAL_AUDIENCE', 'ENGAGED_AUDIENCE'],
          report_attribution_type: 'ORGANIC'
        };
        break;
      case 'audience':
        apiUrl = `https://api.pinterest.com/v5/ad_accounts/${appId}/audience_insights/interests`;
        apiParams = {
          audience_type: 'ENGAGED',
          format: "PERCENTAGE"
        };
        break;
      case 'profile':
        apiUrl = `https://api.pinterest.com/v5/user_account`;
        apiParams = {};
        break;
      default:
        throw new Error('Invalid endpoint');
    }
    
    // Make the request to Pinterest API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: endpoint !== 'profile' ? JSON.stringify(apiParams) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinterest API error:', errorData);
      throw new Error(`Pinterest API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions
function getCurrentDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

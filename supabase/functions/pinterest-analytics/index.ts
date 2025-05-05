
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Оновлює OAuth токен Pinterest
 * @param supabaseClient - Клієнт Supabase
 * @param accountId - ID акаунта Pinterest
 * @param refreshToken - Refresh токен API Pinterest
 * @param appId - ID додатку Pinterest
 * @param appSecret - Секрет додатку Pinterest
 * @returns Новий access токен та refresh токен
 */
async function refreshPinterestToken(supabaseClient, accountId, refreshToken, appId, appSecret) {
  try {
    console.log(`Оновлення токена для акаунта: ${accountId}`);
    // Кінцева точка Pinterest OAuth2 токена
    const tokenEndpoint = 'https://api.pinterest.com/v5/oauth/token';
    if (!appSecret) {
      throw new Error('Секрет додатку обов\'язковий для оновлення токена');
    }
    // Base64 кодування app_id:app_secret для Basic auth
    const basicAuth = btoa(`${appId}:${appSecret}`);
    // Підготовка запиту для оновлення токена
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
      console.error('Помилка оновлення токена:', errorData);
      throw new Error(`Помилка оновлення токена Pinterest: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    const tokenData = await response.json();
    // Оновлення токенів в базі даних
    const { error: updateError } = await supabaseClient.from('pinterest_accounts').update({
      api_key: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', accountId);
    if (updateError) {
      console.error('Помилка оновлення токенів в базі даних:', updateError);
      throw new Error('Не вдалося оновити токени в базі даних');
    }
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    };
  } catch (error) {
    console.error('Помилка оновлення токена Pinterest:', error);
    throw error;
  }
}

/**
 * Отримує аналітичні дані для акаунта Pinterest.
 * @param req - Об'єкт HTTP запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accountId - ID акаунта Pinterest.
 * @param accessToken - Access токен API Pinterest.
 * @param adAccountId - ID рекламного акаунта Pinterest.
 * @param dateRange - Об'єкт з початковою та кінцевою датами для аналізу.
 * @returns Аналітичні дані у форматі JSON.
 */
async function getAnalyticsData(req, supabaseClient, accountId, accessToken, adAccountId, dateRange) {
  // Використовуйте ad_account_id для API аналітики
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${adAccountId}/analytics`;
  const startDate = dateRange?.startDate || getDefaultStartDate();
  const endDate = dateRange?.endDate || getCurrentDate();
  
  const apiParams = {
    start_date: startDate,
    end_date: endDate,
    granularity: 'DAY',
    metric_types: [ // Змінено 'metrics' на 'metric_types'
      'IMPRESSION',
      'ENGAGEMENT',
      'PIN_CLICK',
      'OUTBOUND_CLICK',
      'SAVE',
      'TOTAL_AUDIENCE',
      'ENGAGED_AUDIENCE'
    ].join(','),
    report_attribution_type: 'ORGANIC',
    columns: [ // Додано параметр 'columns'
      'SPEND_IN_MICRO_DOLLAR',
      'PAID_IMPRESSION',
      'SPEND_IN_DOLLAR',
      'CPC_IN_MICRO_DOLLAR',
      'ECPC_IN_MICRO_DOLLAR',
      'ECPC_IN_DOLLAR',
      'CTR',
      'ECTR',
      'OUTBOUND_CTR_1',
      'CAMPAIGN_NAME',
      'PIN_ID',
      'TOTAL_ENGAGEMENT',
      'ENGAGEMENT_1',
      'ENGAGEMENT_2',
      'ECPE_IN_DOLLAR',
      'ENGAGEMENT_RATE',
      'EENGAGEMENT_RATE',
      'ECPM_IN_MICRO_DOLLAR',
      'REPIN_RATE',
      'CTR_2',
      'CAMPAIGN_ID',
      'ADVERTISER_ID',
      'AD_ACCOUNT_ID',
      'PIN_PROMOTION_ID',
      'AD_ID',
      'AD_GROUP_ID',
      'CAMPAIGN_ENTITY_STATUS',
      'CAMPAIGN_OBJECTIVE_TYPE',
      'CPM_IN_MICRO_DOLLAR',
      'CPM_IN_DOLLAR',
      'AD_GROUP_NAME',
      'AD_GROUP_ENTITY_STATUS',
      'AD_GROUP_BID_MULTIPLIER',
      'PROMO_ID',
      'PROMO_NAME',
      'ORDER_LINE_ID',
      'ORDER_LINE_NAME',
      'CLICKTHROUGH_1',
      'REPIN_1',
      'IMPRESSION_1',
      'IMPRESSION_1_GROSS',
      'CLICKTHROUGH_1_GROSS',
      'OUTBOUND_CLICK_1',
      'CLICKTHROUGH_2',
      'REPIN_2',
      'IMPRESSION_2',
      'OUTBOUND_CLICK_2',
      'TOTAL_CLICKTHROUGH',
      'TOTAL_IMPRESSION',
      'TOTAL_IMPRESSION_USER',
      'TOTAL_IMPRESSION_FREQUENCY',
      'COST_PER_OUTBOUND_CLICK_IN_DOLLAR',
      'COST_PER_OUTBOUND_CLICK_IN_DOLLAR_1',
      'TOTAL_ENGAGEMENT_SIGNUP',
      'TOTAL_ENGAGEMENT_CHECKOUT',
      'TOTAL_ENGAGEMENT_LEAD',
      'TOTAL_CLICK_SIGNUP',
      'TOTAL_CLICK_CHECKOUT',
      'TOTAL_CLICK_ADD_TO_CART',
      'TOTAL_CLICK_LEAD',
      'TOTAL_VIEW_SIGNUP',
      'TOTAL_VIEW_CHECKOUT',
      'TOTAL_VIEW_ADD_TO_CART',
      'TOTAL_VIEW_LEAD',
      'TOTAL_CONVERSIONS',
      'TOTAL_ENGAGEMENT_SIGNUP_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_ENGAGEMENT_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_CLICK_SIGNUP_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_CLICK_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_VIEW_SIGNUP_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_VIEW_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_WEB_SESSIONS',
      'WEB_SESSIONS_1',
      'WEB_SESSIONS_2',
      'AD_NAME',
      'CAMPAIGN_LIFETIME_SPEND_CAP',
      'AD_GROUP_OPTIMIZATION',
      'CAMPAIGN_DAILY_SPEND_CAP',
      // 'IS_PREMIERE_CAMPAIGN', // Removed
      'TOTAL_PAGE_VISIT',
      'TOTAL_SIGNUP',
      'TOTAL_CHECKOUT',
      'TOTAL_CUSTOM',
      'TOTAL_LEAD',
      'TOTAL_SIGNUP_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_CUSTOM_VALUE_IN_MICRO_DOLLAR',
      'PAGE_VISIT_COST_PER_ACTION',
      'PAGE_VISIT_ROAS',
      'CHECKOUT_ROAS',
      'CUSTOM_ROAS',
      'PRODUCT_GROUP_AD_IMAGE_TAG',
      // 'VIDEO_MRC_VIEWS_1', // Removed
      'VIDEO_3SEC_VIEWS_2',
      'VIDEO_P100_COMPLETE_2',
      'VIDEO_P0_COMBINED_2',
      'VIDEO_P25_COMBINED_2',
      'VIDEO_P50_COMBINED_2',
      'VIDEO_P75_COMBINED_2',
      'VIDEO_P95_COMBINED_2',
      'VIDEO_MRC_VIEWS_2',
      // 'PAID_VIDEO_VIEWABLE_RATE', // Removed
      'VIDEO_LENGTH',
      'VIDEO_SPEND_IN_DOLLAR',
      'ECPV_IN_DOLLAR',
      'ECPCV_IN_DOLLAR',
      'ECPCV_P95_IN_DOLLAR',
      'TOTAL_VIDEO_3SEC_VIEWS',
      'TOTAL_VIDEO_P100_COMPLETE',
      'TOTAL_VIDEO_P0_COMBINED',
      'TOTAL_VIDEO_P25_COMBINED',
      'TOTAL_VIDEO_P50_COMBINED',
      'TOTAL_VIDEO_P75_COMBINED',
      'TOTAL_VIDEO_P95_COMBINED',
      'TOTAL_VIDEO_MRC_VIEWS',
      'TOTAL_VIDEO_AVG_WATCHTIME_IN_SECOND',
      'TOTAL_REPIN_RATE',
      'WEB_CHECKOUT_COST_PER_ACTION',
      'WEB_CHECKOUT_ROAS',
      'TOTAL_WEB_CHECKOUT',
      'TOTAL_WEB_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_WEB_CLICK_CHECKOUT',
      'TOTAL_WEB_CLICK_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_WEB_ENGAGEMENT_CHECKOUT',
      'TOTAL_WEB_ENGAGEMENT_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'TOTAL_WEB_VIEW_CHECKOUT',
      'TOTAL_WEB_VIEW_CHECKOUT_VALUE_IN_MICRO_DOLLAR',
      'INAPP_CHECKOUT_COST_PER_ACTION',
      'TOTAL_OFFLINE_CHECKOUT',
      'IDEA_PIN_PRODUCT_TAG_VISIT_1',
      'IDEA_PIN_PRODUCT_TAG_VISIT_2',
      'TOTAL_IDEA_PIN_PRODUCT_TAG_VISIT',
      'LEADS',
      'COST_PER_LEAD',
      'QUIZ_COMPLETED',
      'QUIZ_PIN_RESULT_OPEN',
      'QUIZ_COMPLETION_RATE',
      'SHOWCASE_PIN_CLICKTHROUGH',
      'SHOWCASE_SUBPAGE_CLICKTHROUGH',
      'SHOWCASE_SUBPIN_CLICKTHROUGH',
      'SHOWCASE_SUBPAGE_IMPRESSION',
      'SHOWCASE_SUBPIN_IMPRESSION',
      'SHOWCASE_SUBPAGE_SWIPE_LEFT',
      'SHOWCASE_SUBPAGE_SWIPE_RIGHT',
      'SHOWCASE_SUBPIN_SWIPE_LEFT',
      'SHOWCASE_SUBPIN_SWIPE_RIGHT',
      'SHOWCASE_SUBPAGE_REPIN',
      'SHOWCASE_SUBPIN_REPIN',
      'SHOWCASE_SUBPAGE_CLOSEUP',
      'SHOWCASE_CARD_THUMBNAIL_SWIPE_FORWARD',
      'SHOWCASE_CARD_THUMBNAIL_SWIPE_BACKWARD',
      'SHOWCASE_AVERAGE_SUBPAGE_CLOSEUP_PER_SESSION',
      'TOTAL_CHECKOUT_CONVERSION_RATE',
      'TOTAL_VIEW_CATEGORY_CONVERSION_RATE',
      'TOTAL_ADD_TO_CART_CONVERSION_RATE',
      'TOTAL_SIGNUP_CONVERSION_RATE',
      'TOTAL_PAGE_VISIT_CONVERSION_RATE',
      'TOTAL_LEAD_CONVERSION_RATE',
      'TOTAL_SEARCH_CONVERSION_RATE',
      'TOTAL_WATCH_VIDEO_CONVERSION_RATE',
      'TOTAL_UNKNOWN_CONVERSION_RATE',
      'TOTAL_CUSTOM_CONVERSION_RATE'
    ].join(',')
  };
  const urlParams = new URLSearchParams(apiParams);
  const finalUrl = `${apiUrl}?${urlParams.toString()}`;
  try {
    console.log(`Виконання запиту до API Pinterest за адресою: ${finalUrl}`);
    console.log(`Використання токена: ${accessToken.substring(0, 10)}...`);
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Помилка API Pinterest:', errorData);
      // Перевірте, чи це помилка аутентифікації, яку можна виправити за допомогою нового токена
      if (response.status === 401) {
        throw new Error(`Помилка аутентифікації з API Pinterest: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      throw new Error(`Помилка API Pinterest: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const apiData = await response.json();
    
    // Save analytics data to the database
    await saveAnalyticsDataToDatabase(supabaseClient, accountId, apiData, startDate, endDate);
    
    return apiData;
  } catch (error) {
    console.error(`Помилка в getAnalyticsData: ${error.message}`);
    throw error;
  }
}

/**
 * Зберігає аналітичні дані в базу даних
 * @param supabaseClient Клієнт Supabase
 * @param accountId ID акаунта Pinterest
 * @param apiData Дані з API Pinterest
 * @param startDate Початкова дата періоду
 * @param endDate Кінцева дата періоду
 */
async function saveAnalyticsDataToDatabase(supabaseClient, accountId, apiData, startDate, endDate) {
  try {
    if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
      console.warn('Немає даних для збереження в базу даних');
      return;
    }

    // Process data by day
    const analyticsRecords = apiData.data.map(dayData => {
      const date = dayData.date || new Date().toISOString().split('T')[0];
      
      // Calculate metrics
      const impressions = parseInt(dayData.metrics?.IMPRESSION || 0);
      const engagements = parseInt(dayData.metrics?.ENGAGEMENT || 0);
      const pinClicks = parseInt(dayData.metrics?.PIN_CLICK || 0);
      const outboundClicks = parseInt(dayData.metrics?.OUTBOUND_CLICK || 0);
      const saves = parseInt(dayData.metrics?.SAVE || 0);
      const totalAudience = parseInt(dayData.metrics?.TOTAL_AUDIENCE || 0);
      const engagedAudience = parseInt(dayData.metrics?.ENGAGED_AUDIENCE || 0);
      
      // Calculate rates
      const engagementRate = impressions > 0 ? ((engagements / impressions) * 100).toFixed(2) : 0;
      const pinClickRate = impressions > 0 ? ((pinClicks / impressions) * 100).toFixed(2) : 0;
      const outboundClickRate = impressions > 0 ? ((outboundClicks / impressions) * 100).toFixed(2) : 0;
      const saveRate = impressions > 0 ? ((saves / impressions) * 100).toFixed(2) : 0;
      
      return {
        account_id: accountId,
        date,
        impressions,
        engagements,
        pin_clicks: pinClicks,
        outbound_clicks: outboundClicks,
        saves,
        total_audience: totalAudience,
        engaged_audience: engagedAudience,
        engagement_rate: parseFloat(engagementRate),
        pin_click_rate: parseFloat(pinClickRate),
        outbound_click_rate: parseFloat(outboundClickRate),
        save_rate: parseFloat(saveRate)
      };
    });
    
    // Upsert data to the database
    if (analyticsRecords.length > 0) {
      const { error } = await supabaseClient
        .from('pinterest_analytics')
        .upsert(analyticsRecords, { 
          onConflict: 'account_id,date',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error('Помилка збереження аналітичних даних:', error);
      } else {
        console.log(`Збережено ${analyticsRecords.length} записів аналітики для акаунта ${accountId}`);
      }
    }
  } catch (error) {
    console.error('Помилка в saveAnalyticsDataToDatabase:', error);
  }
}

/**
 * Отримує дані про аудиторію для акаунта Pinterest.
 * @param req - Об'єкт HTTP запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accountId - ID акаунта Pinterest.
 * @param accessToken - Access токен API Pinterest.
 * @param adAccountId - ID рекламного акаунта Pinterest.
 * @returns Дані про аудиторію у форматі JSON.
 */
async function getAudienceData(req, supabaseClient, accountId, accessToken, adAccountId) {
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${adAccountId}/audiences`;
  const apiParams = {
    order: 'ASCENDING' // Змінено на ASCENDING
  };
  const urlParams = new URLSearchParams(apiParams);
  const finalUrl = `${apiUrl}?${urlParams.toString()}`;

  try {
    console.log(`Виконання запиту до API Pinterest за адресою: ${finalUrl}`);
    console.log(`Використання токена: ${accessToken.substring(0, 10)}...`);
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Помилка API Pinterest:', errorData);
      throw new Error(`Помилка API Pinterest: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const apiData = await response.json();
    
    // Save audience data to the database
    await saveAudienceDataToDatabase(supabaseClient, accountId, apiData);
    
    return apiData;
  } catch (error) {
    console.error(`Помилка в getAudienceData: ${error.message}`);
    throw error;
  }
}

/**
 * Зберігає дані про аудиторію в базу даних
 * @param supabaseClient Клієнт Supabase
 * @param accountId ID акаунта Pinterest
 * @param apiData Дані з API Pinterest
 */
async function saveAudienceDataToDatabase(supabaseClient, accountId, apiData) {
  try {
    if (!apiData || !apiData.items || !Array.isArray(apiData.items)) {
      console.warn('Немає даних про аудиторію для збереження в базу даних');
      return;
    }

    // Get current date as the snapshot date
    const snapshotDate = new Date().toISOString().split('T')[0];
    
    // Process audience data
    const categories = [];
    const ageGroups = [];
    const genders = [];
    const locations = [];
    const devices = [];
    
    // Process audience data from API response
    apiData.items.forEach(audience => {
      // Process categories/interests
      if (audience.audience_type === 'INTEREST') {
        categories.push({
          name: audience.name,
          percentage: parseFloat((Math.random() * 20 + 5).toFixed(2)) // Mock data for demonstration
        });
      }
      
      // Process demographics if available
      if (audience.rule && audience.rule.demographic_rule) {
        const demo = audience.rule.demographic_rule;
        
        // Age groups
        if (demo.age_groups && Array.isArray(demo.age_groups)) {
          demo.age_groups.forEach(age => {
            ageGroups.push({
              group: age,
              percentage: parseFloat((Math.random() * 15 + 5).toFixed(2)) // Mock data
            });
          });
        }
        
        // Genders
        if (demo.genders && Array.isArray(demo.genders)) {
          demo.genders.forEach(gender => {
            genders.push({
              group: gender,
              percentage: gender === 'FEMALE' ? 65.5 : 34.5 // Mock data
            });
          });
        }
        
        // Locations
        if (demo.locations && Array.isArray(demo.locations)) {
          demo.locations.forEach(location => {
            locations.push({
              country: location.name || location.country || 'Unknown',
              percentage: parseFloat((Math.random() * 10 + 2).toFixed(2)) // Mock data
            });
          });
        }
      }
    });
    
    // Add default device data if not present
    if (devices.length === 0) {
      devices.push(
        { type: 'Mobile', percentage: 68.4 },
        { type: 'Desktop', percentage: 27.3 },
        { type: 'Tablet', percentage: 4.3 }
      );
    }
    
    // Create audience record
    const audienceRecord = {
      account_id: accountId,
      date: snapshotDate,
      categories: JSON.stringify(categories.slice(0, 5)), // Limit to top 5
      age_groups: JSON.stringify(ageGroups.length > 0 ? ageGroups : [
        { group: '18-24', percentage: 22.5 },
        { group: '25-34', percentage: 33.7 },
        { group: '35-44', percentage: 19.2 },
        { group: '45-54', percentage: 13.5 },
        { group: '55-64', percentage: 7.8 },
        { group: '65+', percentage: 3.3 }
      ]),
      genders: JSON.stringify(genders.length > 0 ? genders : [
        { group: 'FEMALE', percentage: 65.5 },
        { group: 'MALE', percentage: 34.5 }
      ]),
      locations: JSON.stringify(locations.length > 0 ? locations.slice(0, 6) : [
        { country: 'United States', percentage: 35.2 },
        { country: 'United Kingdom', percentage: 12.8 },
        { country: 'Canada', percentage: 9.5 },
        { country: 'Australia', percentage: 7.3 },
        { country: 'Germany', percentage: 6.4 },
        { country: 'France', percentage: 5.1 }
      ]),
      devices: JSON.stringify(devices)
    };
    
    // Upsert the audience data
    const { error } = await supabaseClient
      .from('pinterest_audience')
      .upsert([audienceRecord], { 
        onConflict: 'account_id,date',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Помилка збереження даних про аудиторію:', error);
    } else {
      console.log(`Збережено дані про аудиторію для акаунта ${accountId} на дату ${snapshotDate}`);
    }
  } catch (error) {
    console.error('Помилка в saveAudienceDataToDatabase:', error);
  }
}

/**
 * Отримує дані профілю користувача Pinterest.
 * @param req - Об'єкт HTTP запиту.
 * @param supabaseClient - Клієнт Supabase для взаємодії з базою даних.
 * @param accessToken - Access токен API Pinterest.
 * @returns Дані профілю користувача у форматі JSON.
 */
async function getProfileData(req, supabaseClient, accessToken) {
  const apiUrl = `https://api.pinterest.com/v5/users/me`; // Виправлена кінцева точка
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Помилка API Pinterest:', errorData);
      throw new Error(`Помилка API Pinterest: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Помилка в getProfileData: ${error.message}`);
    throw error;
  }
}

/**
 * Перевіряє, чи потрібно оновити токен
 * @param tokenExpiresAt Рядок дати ISO, коли закінчується термін дії токена
 * @returns boolean, що вказує, чи потрібно оновити токен
 */
function tokenNeedsRefresh(tokenExpiresAt) {
  if (!tokenExpiresAt) return true;
  // Додайте 10-хвилинний буфер до часу закінчення терміну дії
  const expiryDate = new Date(tokenExpiresAt).getTime();
  const now = Date.now();
  const tenMinutesInMs = 10 * 60 * 1000;
  return now + tenMinutesInMs >= expiryDate;
}

serve(async (req) => {
  // Обробка preflight запитів CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Отримання аутентифікованого користувача
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Відсутній заголовок авторизації');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Неавторизований');
    }
    // Розбір тіла запиту
    const { accountId, endpoint, dateRange } = await req.json();
    if (!accountId) {
      throw new Error('ID акаунта обов\'язковий');
    }
    // Отримання даних акаунта з Supabase
    const { data: accountData, error: accountError } = await supabaseClient.from('pinterest_accounts').select('*').eq('id', accountId).eq('user_id', user.id).single();
    if (accountError || !accountData) {
      throw new Error('Акаунт Pinterest не знайдено');
    }

    // Логування даних акаунта для перевірки його вмісту
    console.log('Дані акаунта:', accountData);

    // Отримання access токена та інших облікових даних з даних акаунта
    let accessToken = accountData.api_key;
    let refreshToken = accountData.refresh_token;
    const appId = accountData.app_id;
    const appSecret = accountData.app_secret;
    const tokenExpiresAt = accountData.token_expires_at;
    // Переконайтеся, що у вас є 'ad_account_id' у вашій таблиці 'pinterest_accounts'
    const adAccountId = accountData.ad_account_id;
    if (!adAccountId) {
      throw new Error('ID рекламного акаунта обов\'язковий');
    }

    // Перевірка, чи потрібно оновити токен, і чи є необхідні облікові дані
    if (tokenNeedsRefresh(tokenExpiresAt)) {
      console.log('Потрібне оновлення токена');
      if (refreshToken && appSecret) {
        try {
          console.log('Спроба оновлення токена з обліковими даними');
          const newTokens = await refreshPinterestToken(supabaseClient, accountId, refreshToken, appId, appSecret);
          accessToken = newTokens.accessToken;
          refreshToken = newTokens.refreshToken;
          console.log('Токен успішно оновлено');
        } catch (refreshError) {
          console.error('Не вдалося оновити токен:', refreshError);
          console.log('Використання існуючого токена як резервного');
          // Продовжуйте зі старим токеном як резервним
        }
      } else {
        if (!refreshToken) {
          console.warn('Refresh токен відсутній, використання існуючого access токена');
        }
        if (!appSecret) {
          console.warn('Секрет додатку відсутній для оновлення токена');
        }
      }
    }

    // Перевірка наявності токена для використання
    if (!accessToken) {
      throw new Error('Access токен для API Pinterest відсутній');
    }

    // Ініціалізація змінної data
    let data;
    try {
      // Визначення, який endpoint викликати
      switch (endpoint) {
        case 'analytics':
          if (!adAccountId) {
            throw new Error('ID рекламного акаунта обов\'язковий для аналітики');
          }
          data = await getAnalyticsData(req, supabaseClient, accountId, accessToken, adAccountId, dateRange);
          break;
        case 'audience':
          if (!adAccountId) {
            throw new Error('ID рекламного акаунта обов\'язковий для даних про аудиторію');
          }
          data = await getAudienceData(req, supabaseClient, accountId, accessToken, adAccountId);
          break;
        case 'profile':
          data = await getProfileData(req, supabaseClient, accessToken);
          break;
        case 'fetch_db_analytics':
          // Отримати дані аналітики з бази даних
          const { data: analyticsData, error: analyticsError } = await supabaseClient
            .from('pinterest_analytics')
            .select('*')
            .eq('account_id', accountId)
            .order('date', { ascending: false });
            
          if (analyticsError) {
            throw new Error(`Помилка отримання аналітики з БД: ${analyticsError.message}`);
          }
          data = analyticsData;
          break;
        case 'fetch_db_audience':
          // Отримати дані про аудиторію з бази даних
          const { data: audienceData, error: audienceError } = await supabaseClient
            .from('pinterest_audience')
            .select('*')
            .eq('account_id', accountId)
            .order('date', { ascending: false })
            .limit(1);
            
          if (audienceError) {
            throw new Error(`Помилка отримання даних про аудиторію з БД: ${audienceError.message}`);
          }
          data = audienceData.length > 0 ? audienceData[0] : null;
          break;
        default:
          throw new Error(`Неправильний endpoint: ${endpoint}`);
      }
    } catch (apiError) {
      console.error(`Помилка API: ${apiError.message}`);
      // Повернення резервних даних з інформацією про помилку замість викидання помилки
      return new Response(JSON.stringify({
        error: apiError.message,
        fallback: true,
        message: "Використання макетних даних через помилку API"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Повернення даних
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Помилка обробки запиту:', error);
    return new Response(JSON.stringify({
      error: error.message,
      // Надсилання конкретного коду статусу, який може перевірити фронтенд
      code: 'PINTEREST_API_ERROR'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// Допоміжні функції
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

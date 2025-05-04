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
  const apiParams = {
    start_date: dateRange?.startDate || getDefaultStartDate(),
    end_date: dateRange?.endDate || getCurrentDate(),
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
      'DATE',
      'IMPRESSION',
      'ENGAGEMENT',
      'PIN_CLICK',
      'OUTBOUND_CLICK',
      'SAVE',
      'TOTAL_AUDIENCE',
      'ENGAGED_AUDIENCE'
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
    return await response.json();
  } catch (error) {
    console.error(`Помилка в getAnalyticsData: ${error.message}`);
    throw error;
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
  // Кінцева точка для аналізу аудиторії змінилася і потребує ID рекламного акаунта
  const apiUrl = `https://api.pinterest.com/v5/ad_accounts/${adAccountId}/targeting_options`; // Changed endpoint
  const apiParams = {
    targeting_type: 'INTERESTS', //  targeting_type instead of type
    // Додайте інші відповідні параметри на основі документації
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
    return await response.json();
  } catch (error) {
    console.error(`Помилка в getAudienceData: ${error.message}`);
    throw error;
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

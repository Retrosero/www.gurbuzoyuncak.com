Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Sadece POST metodu kabul et
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Sadece POST metodu destekleniyor' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    const { view_name, action } = requestData;

    // Supabase bağlantısı
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase yapılandırması eksik');
    }

    // Function to refresh materialized views
    const refreshViews = async (viewName: string) => {
      let sqlQuery = '';
      
      switch (viewName) {
        case 'all':
          sqlQuery = 'SELECT refresh_dashboard_mviews();';
          break;
        case 'dashboard_stats':
          sqlQuery = 'SELECT refresh_dashboard_mview(\'dashboard_stats\');';
          break;
        case 'daily_sales':
          sqlQuery = 'SELECT refresh_dashboard_mview(\'daily_sales\');';
          break;
        case 'category_performance':
          sqlQuery = 'SELECT refresh_dashboard_mview(\'category_performance\');';
          break;
        case 'brand_performance':
          sqlQuery = 'SELECT refresh_dashboard_mview(\'brand_performance\');';
          break;
        default:
          sqlQuery = 'SELECT refresh_dashboard_mviews();';
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sqlQuery })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL execution failed: ${errorText}`);
      }

      return true;
    };

    // View'ları refresh et
    await refreshViews(view_name || 'all');

    const result = {
      success: true,
      message: `${view_name || 'all'} materialized view'ları başarıyla refresh edildi`,
      timestamp: new Date().toISOString(),
      refreshed_view: view_name || 'all'
    };

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Refresh dashboard data error:', error);
    
    const errorResponse = {
      error: {
        code: 'REFRESH_ERROR',
        message: error.message || 'Dashboard verileri yenilenemedi'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
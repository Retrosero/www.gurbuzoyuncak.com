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
        // Supabase client oluştur
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase konfigürasyonu bulunamadı');
        }

        // Planlanmış indirimleri uygula
        const scheduledResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/apply_scheduled_discounts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            }
        });

        const scheduledResult = await scheduledResponse.json();

        // Süresi dolmuş indirimleri kaldır
        const expiredResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/remove_expired_discounts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            }
        });

        const expiredResult = await expiredResponse.json();

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            scheduled_applied: scheduledResult,
            expired_removed: expiredResult,
            message: 'Bulk discount otomasyonu başarıyla çalıştırıldı'
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            message: 'Bulk discount otomasyonu sırasında hata oluştu'
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
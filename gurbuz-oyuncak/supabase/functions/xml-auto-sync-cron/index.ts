Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
            throw new Error('Supabase yapılandırması eksik');
        }

        console.log('[CRON] Otomatik XML senkronizasyonu başlatılıyor...');

        // Ayarları kontrol et
        const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/xml_sync_settings?select=*&is_enabled=eq.true&limit=1`, {
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': SERVICE_ROLE_KEY
            }
        });

        const settings = await settingsResponse.json();

        if (!settings || settings.length === 0) {
            console.log('[CRON] Otomatik senkronizasyon devre dışı');
            return new Response(JSON.stringify({
                message: 'Otomatik senkronizasyon devre dışı',
                executed: false
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const config = settings[0];

        // XML kaynağını kontrol et
        if (!config.xml_source_url) {
            console.log('[CRON] XML kaynak URL\'si yapılandırılmamış');
            return new Response(JSON.stringify({
                message: 'XML kaynak URL\'si yapılandırılmamış',
                executed: false
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // URL'den XML içeriğini çek
        console.log(`[CRON] XML kaynağından veri çekiliyor: ${config.xml_source_url}`);
        
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(config.xml_source_url)}`;
        const xmlResponse = await fetch(proxyUrl);

        if (!xmlResponse.ok) {
            throw new Error(`XML kaynağına erişilemedi: ${xmlResponse.status}`);
        }

        const xmlData = await xmlResponse.json();
        const xmlContent = xmlData.contents;

        if (!xmlContent) {
            throw new Error('XML içeriği alınamadı');
        }

        console.log('[CRON] XML içeriği başarıyla alındı, senkronizasyon başlatılıyor...');

        // xml-product-sync fonksiyonunu çağır
        const syncResponse = await fetch(`${SUPABASE_URL}/functions/v1/xml-product-sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                xmlContent,
                filename: config.xml_source_url.split('/').pop() || 'auto-sync.xml',
                source: 'url',
                userId: null // Sistem tarafından otomatik
            })
        });

        const syncResult = await syncResponse.json();

        // Ayarları güncelle (son çalışma zamanı)
        await fetch(`${SUPABASE_URL}/rest/v1/xml_sync_settings?id=eq.${config.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                last_run_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        console.log('[CRON] Otomatik senkronizasyon tamamlandı');

        return new Response(JSON.stringify({
            message: 'Otomatik senkronizasyon başarılı',
            executed: true,
            result: syncResult
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[CRON] Hata:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'AUTO_SYNC_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Stok Monitor Edge Function
// Bu function düzenli olarak stok seviyelerini kontrol eder ve uyarılar oluşturur

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
        console.log('Stok monitor başlatılıyor...');
        
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase bilgileri eksik');
        }

        // Admin ayarlarını getir
        const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_settings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!settingsResponse.ok) {
            throw new Error('Admin ayarları alınamadı');
        }

        const settings = await settingsResponse.json();
        
        // Ayarları bir Map'e çevir
        const settingsMap = new Map();
        settings.forEach(setting => {
            settingsMap.set(setting.setting_key, setting.setting_value);
        });

        // Eşik değerlerini al
        const lowThreshold = parseInt(settingsMap.get('stock_low_threshold')) || 10;
        const criticalThreshold = parseInt(settingsMap.get('stock_critical_threshold')) || 5;
        const outThreshold = parseInt(settingsMap.get('stock_out_threshold')) || 0;
        const emailEnabled = settingsMap.get('stock_alert_email_enabled') === 'true';
        const autoResolve = settingsMap.get('stock_auto_resolve') === 'true';
        
        console.log(`Eşik değerleri: Düşük=${lowThreshold}, Kritik=${criticalThreshold}, Tükendi=${outThreshold}`);

        // Ürünleri ve stoklarını getir
        const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,stock&stock.lte.${lowThreshold}&is_active=eq.true`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!productsResponse.ok) {
            throw new Error('Ürünler alınamadı');
        }

        const products = await productsResponse.json();
        console.log(`${products.length} ürün düşük stok seviyesinde`);

        const alerts = [];
        const processedProducts = new Set();

        // Her ürün için kontrol yap
        for (const product of products) {
            const currentStock = product.stock;
            let alertType = '';
            let priority = 'medium';
            let message = '';

            if (currentStock <= outThreshold) {
                alertType = 'out_of_stock';
                priority = 'critical';
                message = `${product.name} ürünü stokta kalmadı (Mevcut: ${currentStock})`;
            } else if (currentStock <= criticalThreshold) {
                alertType = 'critical_stock';
                priority = 'high';
                message = `${product.name} ürünü kritik seviyede (Mevcut: ${currentStock})`;
            } else if (currentStock <= lowThreshold) {
                alertType = 'low_stock';
                priority = 'medium';
                message = `${product.name} ürünü düşük seviyede (Mevcut: ${currentStock})`;
            }

            if (alertType && !processedProducts.has(product.id)) {
                // Mevcut aktif uyarı var mı kontrol et
                const existingAlertResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/stock_alerts?product_id=eq.${product.id}&status=eq.active&alert_type=eq.${alertType}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const existingAlerts = await existingAlertResponse.json();
                
                if (existingAlerts.length === 0) {
                    // Yeni uyarı oluştur
                    const alert = {
                        product_id: product.id,
                        alert_type: alertType,
                        current_stock: currentStock,
                        threshold_value: alertType === 'out_of_stock' ? outThreshold : 
                                         alertType === 'critical_stock' ? criticalThreshold : lowThreshold,
                        message: message,
                        priority: priority
                    };
                    alerts.push(alert);
                    processedProducts.add(product.id);
                } else {
                    // Mevcut uyarıyı güncelle
                    await fetch(`${SUPABASE_URL}/rest/v1/stock_alerts?id=eq.${existingAlerts[0].id}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            current_stock: currentStock,
                            message: message
                        })
                    });
                }

                // Otomatik çözme kontrolü
                if (autoResolve && currentStock > lowThreshold) {
                    await fetch(`${SUPABASE_URL}/rest/v1/stock_alerts?product_id=eq.${product.id}&status=eq.active`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: 'resolved',
                            resolved_at: new Date().toISOString()
                        })
                    });
                }
            }
        }

        // Yeni uyarıları veritabanına ekle
        if (alerts.length > 0) {
            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/stock_alerts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alerts)
            });

            if (!insertResponse.ok) {
                console.error('Uyarılar eklenemedi');
            } else {
                console.log(`${alerts.length} yeni uyarı oluşturuldu`);
            }
        }

        // E-posta bildirimleri gönder
        if (emailEnabled && alerts.length > 0) {
            // Email gönderim servisi çağır
            try {
                const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-stock-alert-email`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ alerts })
                });

                if (emailResponse.ok) {
                    console.log('Email bildirimi başarıyla gönderildi');
                } else {
                    console.error('Email gönderim hatası:', await emailResponse.text());
                }
            } catch (emailError) {
                console.error('Email gönderim servis hatası:', emailError.message);
            }
        }

        // Webhook gönder (opsiyonel)
        const webhookUrl = settingsMap.get('stock_alert_webhook');
        if (webhookUrl && alerts.length > 0) {
            try {
                const payload = {
                    type: 'stock_alerts',
                    timestamp: new Date().toISOString(),
                    alerts: alerts.map(alert => ({
                        product_id: alert.product_id,
                        alert_type: alert.alert_type,
                        current_stock: alert.current_stock,
                        message: alert.message,
                        priority: alert.priority
                    }))
                };

                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                console.log('Webhook bildirimi gönderildi');
            } catch (webhookError) {
                console.error('Webhook gönderme hatası:', webhookError.message);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Stok kontrolü tamamlandı',
            data: {
                products_checked: products.length,
                alerts_created: alerts.length,
                email_sent: emailEnabled,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Stok monitor hatası:', error.message);
        
        return new Response(JSON.stringify({
            error: {
                code: 'STOCK_MONITOR_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});


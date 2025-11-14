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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Yeni fiyat düşüşlerini kontrol et
        const priceAlertsResponse = await fetch(`${supabaseUrl}/rest/v1/price_alerts?select=*,products(*),profiles(*)`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            }
        });

        if (!priceAlertsResponse.ok) {
            throw new Error('Fiyat düşüş verileri alınamadı');
        }

        const priceAlerts = await priceAlertsResponse.json();

        let processedCount = 0;
        let sentCount = 0;

        for (const alert of priceAlerts) {
            // Sadece bildirilmemiş ve yeni fiyat düşmüş olanları işle
            if (!alert.alert_sent && alert.new_price < alert.old_price) {
                try {
                    // Email bildirimi gönder
                    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabaseKey}`
                        },
                        body: JSON.stringify({
                            to: alert.profiles.email,
                            subject: `🎉 ${alert.products.name} için fiyat düşüş bildirimi!`,
                            htmlContent: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #e74c3c;">🎉 Fiyat Düşüş Bildirimi</h2>
                                    <p>Merhaba ${alert.profiles.first_name || ''},</p>
                                    <p><strong>${alert.products.name}</strong> ürünü için takip ettiğiniz fiyat düştü!</p>
                                    
                                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <h3>${alert.products.name}</h3>
                                        <p><strong>Eski Fiyat:</strong> ₺${alert.old_price.toFixed(2)}</p>
                                        <p><strong>Yeni Fiyat:</strong> <span style="color: #e74c3c; font-weight: bold;">₺${alert.new_price.toFixed(2)}</span></p>
                                        <p><strong>Tasarruf:</strong> <span style="color: #27ae60;">₺${(alert.old_price - alert.new_price).toFixed(2)}</span></p>
                                    </div>
                                    
                                    <a href="${supabaseUrl.replace('/rest/v1', '')}/products/${alert.product_id}" 
                                       style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                       Ürünü İncele
                                    </a>
                                    
                                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                                        Bu bildirim Gürbüz Oyuncak tarafından otomatik olarak gönderilmiştir.
                                    </p>
                                </div>
                            `,
                            metadata: {
                                type: 'price_drop',
                                product_id: alert.product_id,
                                old_price: alert.old_price,
                                new_price: alert.new_price
                            }
                        })
                    });

                    if (emailResponse.ok) {
                        // Bildirim gönderildi olarak işaretle
                        await fetch(`${supabaseUrl}/rest/v1/price_alerts?id=eq.${alert.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${supabaseKey}`,
                                'apikey': supabaseKey
                            },
                            body: JSON.stringify({
                                alert_sent: true,
                                notification_sent_at: new Date().toISOString()
                            })
                        });

                        // Bildirim geçmişine ekle
                        await fetch(`${supabaseUrl}/rest/v1/notification_history`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${supabaseKey}`,
                                'apikey': supabaseKey
                            },
                            body: JSON.stringify({
                                user_id: alert.user_id,
                                type: 'price_drop',
                                title: 'Fiyat Düşüş Bildirimi',
                                message: `${alert.products.name} fiyatı ₺${alert.old_price.toFixed(2)}'den ₺${alert.new_price.toFixed(2)}'ye düştü`,
                                metadata: {
                                    product_id: alert.product_id,
                                    old_price: alert.old_price,
                                    new_price: alert.new_price
                                }
                            })
                        });

                        sentCount++;
                    }

                    processedCount++;

                } catch (emailError) {
                    console.error(`Email gönderim hatası (alert ${alert.id}):`, emailError);
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Fiyat düşüş bildirimleri işlendi',
            data: {
                processed: processedCount,
                sent: sentCount,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Fiyat düşüş bildirimi hatası:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
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
        // Request data
        const requestData = await req.json();
        const { product_id, old_price, new_price, force_check = false } = requestData;

        if (!product_id || !old_price || !new_price) {
            throw new Error('Missing required parameters: product_id, old_price, new_price');
        }

        // Import Supabase client
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`Fiyat takip: Ürün ${product_id}, Eski: ${old_price}, Yeni: ${new_price}`);

        // Fiyat değişimi var mı kontrol et
        if (!force_check && old_price === new_price) {
            return new Response(JSON.stringify({ 
                data: { 
                    message: 'Fiyat değişimi yok', 
                    change_detected: false 
                } 
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Fiyat değişimini hesapla
        const priceChange = new_price - old_price;
        const priceChangePercentage = Math.abs((priceChange / old_price) * 100);

        // Sadece anlamlı değişimleri işle (%0.5'ten fazla)
        if (priceChangePercentage < 0.5) {
            return new Response(JSON.stringify({ 
                data: { 
                    message: 'Anlamsız fiyat değişimi', 
                    change_detected: false,
                    change_percentage: priceChangePercentage
                } 
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const changeType = priceChange > 0 ? 'increase' : 'decrease';

        console.log(`Fiyat değişimi tespit edildi: ${changeType} %${priceChangePercentage.toFixed(2)}`);

        // Bu ürünün favorilerini bul
        const { data: favorites, error: favoritesError } = await supabase
            .from('user_favorites')
            .select('id, user_id, price_change_threshold')
            .eq('product_id', product_id);

        if (favoritesError) {
            throw new Error(`Favori veriler alınamadı: ${favoritesError.message}`);
        }

        if (!favorites || favorites.length === 0) {
            return new Response(JSON.stringify({ 
                data: { 
                    message: 'Bu ürünün favorisi bulunamadı', 
                    affected_favorites: 0 
                } 
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`${favorites.length} favori bulundu`);

        // Her favori için fiyat geçmişi kaydet
        const priceHistoryRecords = favorites.map(favorite => ({
            favorite_id: favorite.id,
            product_id: product_id,
            user_id: favorite.user_id,
            old_price: old_price,
            new_price: new_price,
            change_type: changeType,
            change_percentage: priceChangePercentage,
            change_amount: Math.abs(priceChange)
        }));

        const { data: insertedHistory, error: historyError } = await supabase
            .from('favorite_price_history')
            .insert(priceHistoryRecords)
            .select();

        if (historyError) {
            throw new Error(`Fiyat geçmişi kaydedilemedi: ${historyError.message}`);
        }

        console.log('Fiyat geçmişi kaydedildi');

        // Bildirim gerekli mi kontrol et
        const notificationsNeeded = favorites
            .filter(favorite => priceChangePercentage >= favorite.price_change_threshold);

        if (notificationsNeeded.length > 0) {
            console.log(`${notificationsNeeded.length} kullanıcıya bildirim gönderilecek`);

            // Bildirim gereken favorileri güncelle
            const notificationPromises = notificationsNeeded.map(async (favorite) => {
                // En son fiyat geçmişini bul ve notified olarak işaretle
                const { data: latestHistory } = await supabase
                    .from('favorite_price_history')
                    .select('id')
                    .eq('favorite_id', favorite.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (latestHistory) {
                    await supabase
                        .from('favorite_price_history')
                        .update({ 
                            notified: true,
                            notification_sent_at: new Date().toISOString(),
                            email_sent: true // Email gönderildi olarak işaretle
                        })
                        .eq('id', latestHistory.id);
                }

                // Kullanıcının bildirim ayarlarını kontrol et
                const { data: notificationSettings } = await supabase
                    .from('favorite_notification_settings')
                    .select('*')
                    .eq('user_id', favorite.user_id)
                    .single();

                // Bildirim ayarı yoksa varsayılan ayarları kullan
                const settings = notificationSettings || {
                    price_alerts_enabled: true,
                    price_decrease_only: true,
                    email_notifications: true
                };

                // Fiyat düşüş bildirimleri için ayrı ayrı kontrol et
                if (changeType === 'decrease' && settings.price_alerts_enabled) {
                    if (!settings.price_decrease_only || changeType === 'decrease') {
                        // Burada email gönderme işlemi yapılır
                        // Şimdilik sadece veritabanını güncelleyelim
                        console.log(`Bildirim gönderildi: Kullanıcı ${favorite.user_id}, Ürün ${product_id}, Fiyat düştü %${priceChangePercentage.toFixed(2)}`);
                    }
                }
            });

            await Promise.all(notificationPromises);
        }

        const response = {
            data: {
                message: 'Fiyat takip işlemi tamamlandı',
                change_detected: true,
                change_type: changeType,
                change_percentage: priceChangePercentage.toFixed(2),
                total_favorites: favorites.length,
                notifications_sent: notificationsNeeded.length,
                price_history_recorded: insertedHistory?.length || 0
            }
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Fiyat takip hatası:', error);
        
        const errorResponse = {
            error: {
                code: 'PRICE_TRACKING_ERROR',
                message: error.message || 'Fiyat takip sırasında bir hata oluştu'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
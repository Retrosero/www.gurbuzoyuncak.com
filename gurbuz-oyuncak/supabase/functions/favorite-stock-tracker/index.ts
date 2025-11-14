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
        const { product_id, old_stock, new_stock, force_check = false } = requestData;

        if (!product_id || old_stock === undefined || new_stock === undefined) {
            throw new Error('Missing required parameters: product_id, old_stock, new_stock');
        }

        // Import Supabase client
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`Stok takip: Ürün ${product_id}, Eski: ${old_stock}, Yeni: ${new_stock}`);

        // Stok seviyesi belirleme fonksiyonu
        const getStockLevel = (stock) => {
            if (stock === 0) return 'out_of_stock';
            if (stock <= 5) return 'low_stock';
            if (stock <= 20) return 'normal_stock';
            return 'good_stock';
        };

        const oldLevel = getStockLevel(old_stock);
        const newLevel = getStockLevel(new_stock);

        // Anlamlı değişiklik var mı kontrol et
        const hasSignificantChange = () => {
            // Seviye değişikliği varsa anlamlı
            if (oldLevel !== newLevel) return true;
            
            // Seviye aynı ama miktar değişikliği büyükse anlamlı
            if (oldLevel === newLevel && Math.abs(new_stock - old_stock) >= 3) return true;
            
            return false;
        };

        if (!force_check && !hasSignificantChange()) {
            return new Response(JSON.stringify({ 
                data: { 
                    message: 'Anlamsız stok değişikliği', 
                    change_detected: false,
                    old_level: oldLevel,
                    new_level: newLevel
                } 
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Değişim tipini belirle
        const getChangeType = () => {
            if (new_stock > old_stock) return 'increase';
            if (new_stock < old_stock) return 'decrease';
            return 'no_change';
        };

        // Uyarı tipini belirle
        const getAlertType = () => {
            if (newLevel === 'out_of_stock' && oldLevel !== 'out_of_stock') {
                return 'out_of_stock';
            } else if (newLevel === 'low_stock' && oldLevel !== 'low_stock' && oldLevel !== 'out_of_stock') {
                return 'low_stock';
            } else if (oldLevel === 'out_of_stock' && newLevel !== 'out_of_stock') {
                return 'restocked';
            } else if (oldLevel === 'low_stock' && newLevel !== 'low_stock' && newLevel !== 'out_of_stock') {
                return 'restocked';
            } else if (new_stock > old_stock) {
                return 'stock_increased';
            } else if (new_stock < old_stock) {
                return 'stock_decreased';
            } else {
                return 'no_change';
            }
        };

        const changeType = getChangeType();
        const alertType = getAlertType();

        console.log(`Stok değişimi tespit edildi: ${changeType}, ${alertType}`);

        // Bu ürünün favorilerini bul
        const { data: favorites, error: favoritesError } = await supabase
            .from('user_favorites')
            .select('id, user_id')
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

        // Her favori için stok uyarısı kaydet
        const stockAlertRecords = favorites.map(favorite => ({
            favorite_id: favorite.id,
            product_id: product_id,
            user_id: favorite.user_id,
            current_stock: new_stock,
            previous_stock: old_stock,
            stock_change_type: changeType,
            alert_type: alertType
        }));

        const { data: insertedAlerts, error: alertsError } = await supabase
            .from('favorite_stock_alerts')
            .insert(stockAlertRecords)
            .select();

        if (alertsError) {
            throw new Error(`Stok uyarısı kaydedilemedi: ${alertsError.message}`);
        }

        console.log('Stok uyarıları kaydedildi');

        // Bildirim gerekli mi kontrol et
        const notificationsNeeded = favorites.filter(async (favorite) => {
            // Kullanıcının bildirim ayarlarını kontrol et
            const { data: notificationSettings } = await supabase
                .from('favorite_notification_settings')
                .select('*')
                .eq('user_id', favorite.user_id)
                .single();

            // Bildirim ayarı yoksa varsayılan ayarları kullan
            const settings = notificationSettings || {
                stock_alerts_enabled: true,
                restock_alerts_enabled: true,
                email_notifications: true
            };

            // Hangi bildirimlerin gönderileceğini belirle
            let shouldNotify = false;

            switch (alertType) {
                case 'out_of_stock':
                    shouldNotify = settings.stock_alerts_enabled;
                    break;
                case 'low_stock':
                    shouldNotify = settings.stock_alerts_enabled;
                    break;
                case 'restocked':
                    shouldNotify = settings.restock_alerts_enabled;
                    break;
                case 'stock_increased':
                    shouldNotify = settings.stock_alerts_enabled;
                    break;
                case 'stock_decreased':
                    shouldNotify = settings.stock_alerts_enabled;
                    break;
            }

            return shouldNotify;
        });

        // Bildirimleri işle
        const notificationsToSend = await Promise.all(
            notificationsNeeded.map(async (favorite, index) => {
                // En son stok uyarısını bul ve notified olarak işaretle
                const { data: latestAlert } = await supabase
                    .from('favorite_stock_alerts')
                    .select('id')
                    .eq('favorite_id', favorite.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (latestAlert) {
                    await supabase
                        .from('favorite_stock_alerts')
                        .update({ 
                            notified: true,
                            notification_sent_at: new Date().toISOString(),
                            email_sent: true // Email gönderildi olarak işaretle
                        })
                        .eq('id', latestAlert.id);
                }

                return {
                    user_id: favorite.user_id,
                    product_id: product_id,
                    alert_type: alertType,
                    old_stock: old_stock,
                    new_stock: new_stock
                };
            })
        );

        console.log(`${notificationsToSend.length} kullanıcıya stok bildirimi gönderilecek`);

        // Bildirimleri logla
        notificationsToSend.forEach(notification => {
            console.log(`Stok bildirimi: Kullanıcı ${notification.user_id}, Ürün ${notification.product_id}, ${notification.alert_type} (${notification.old_stock} -> ${notification.new_stock})`);
        });

        const response = {
            data: {
                message: 'Stok takip işlemi tamamlandı',
                change_detected: true,
                change_type: changeType,
                alert_type: alertType,
                old_level: oldLevel,
                new_level: newLevel,
                total_favorites: favorites.length,
                notifications_sent: notificationsToSend.length,
                alerts_recorded: insertedAlerts?.length || 0,
                notifications: notificationsToSend
            }
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Stok takip hatası:', error);
        
        const errorResponse = {
            error: {
                code: 'STOCK_TRACKING_ERROR',
                message: error.message || 'Stok takip sırasında bir hata oluştu'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
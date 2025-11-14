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
        const { 
            user_id, 
            notification_type, 
            product_id, 
            product_name, 
            old_value, 
            new_value, 
            change_percentage,
            alert_type 
        } = requestData;

        if (!user_id || !notification_type || !product_id) {
            throw new Error('Missing required parameters: user_id, notification_type, product_id');
        }

        // Import Supabase client
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`Bildirim gönder: Kullanıcı ${user_id}, Tip ${notification_type}, Ürün ${product_id}`);

        // Kullanıcının bildirim ayarlarını kontrol et
        const { data: notificationSettings, error: settingsError } = await supabase
            .from('favorite_notification_settings')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
            throw new Error(`Bildirim ayarları alınamadı: ${settingsError.message}`);
        }

        // Bildirim ayarı yoksa varsayılan ayarları kullan
        const settings = notificationSettings || {
            email_notifications: true,
            sms_notifications: false,
            push_notifications: true
        };

        // Bildirim tipi kontrolü
        let shouldSend = false;
        let message = '';
        let priority = 'normal';

        switch (notification_type) {
            case 'price_decrease':
                shouldSend = settings.price_alerts_enabled && settings.price_decrease_only;
                message = `${product_name} fiyatı %${change_percentage} düştü! Yeni fiyat: ₺${new_value}`;
                priority = change_percentage > 10 ? 'high' : 'normal';
                break;
                
            case 'price_increase':
                shouldSend = settings.price_alerts_enabled && !settings.price_decrease_only;
                message = `${product_name} fiyatı %${change_percentage} arttı. Yeni fiyat: ₺${new_value}`;
                priority = 'normal';
                break;
                
            case 'stock_out':
                shouldSend = settings.stock_alerts_enabled;
                message = `${product_name} stokta kalmadı!`;
                priority = 'high';
                break;
                
            case 'stock_low':
                shouldSend = settings.stock_alerts_enabled;
                message = `${product_name} az kaldı! Son ${new_value} adet`;
                priority = 'medium';
                break;
                
            case 'stock_restocked':
                shouldSend = settings.restock_alerts_enabled;
                message = `${product_name} tekrar stokta! ${new_value} adet mevcut`;
                priority = 'medium';
                break;
                
            default:
                throw new Error(`Bilinmeyen bildirim tipi: ${notification_type}`);
        }

        if (!shouldSend) {
            return new Response(JSON.stringify({ 
                data: { 
                    message: 'Bildirim gönderilmedi - kullanıcı tercihleri gereği',
                    sent: false,
                    reason: 'user_preferences'
                } 
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`Bildirim gönderilecek: ${message}`);

        // Kullanıcı bilgilerini al
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', user_id)
            .single();

        if (userError) {
            console.warn(`Kullanıcı bilgileri alınamadı: ${userError.message}`);
        }

        // Email bildirimi
        let emailSent = false;
        if (settings.email_notifications && user?.email) {
            try {
                // Burada gerçek email gönderme işlemi yapılır
                // Şimdilik sadece logla
                console.log(`Email gönderildi: ${user.email}`);
                console.log(`Konu: ${notification_type === 'price_decrease' ? 'Fiyat Düştü!' : notification_type === 'stock_out' ? 'Stok Bitti!' : 'Favori Ürün Güncellemesi'}`);
                console.log(`Mesaj: ${message}`);
                
                emailSent = true;
            } catch (emailError) {
                console.error('Email gönderme hatası:', emailError);
            }
        }

        // SMS bildirimi
        let smsSent = false;
        if (settings.sms_notifications) {
            try {
                // Burada gerçek SMS gönderme işlemi yapılır
                console.log(`SMS gönderildi kullanıcı ${user_id}: ${message}`);
                smsSent = true;
            } catch (smsError) {
                console.error('SMS gönderme hatası:', smsError);
            }
        }

        // Push bildirimi
        let pushSent = false;
        if (settings.push_notifications) {
            try {
                // Burada gerçek push notification gönderme işlemi yapılır
                console.log(`Push bildirim gönderildi kullanıcı ${user_id}: ${message}`);
                pushSent = true;
            } catch (pushError) {
                console.error('Push bildirim gönderme hatası:', pushError);
            }
        }

        // Bildirim durumunu kaydet (ilgili tablolarda)
        if (notification_type.includes('price')) {
            // Fiyat bildirimi kaydet
            await supabase
                .from('favorite_price_history')
                .update({
                    email_sent: emailSent,
                    sms_sent: smsSent,
                    push_sent: pushSent,
                    notification_sent_at: new Date().toISOString()
                })
                .eq('product_id', product_id)
                .eq('user_id', user_id)
                .eq('notified', true)
                .order('created_at', { ascending: false })
                .limit(1);
        } else if (notification_type.includes('stock')) {
            // Stok bildirimi kaydet
            await supabase
                .from('favorite_stock_alerts')
                .update({
                    email_sent: emailSent,
                    sms_sent: smsSent,
                    push_sent: pushSent,
                    notification_sent_at: new Date().toISOString()
                })
                .eq('product_id', product_id)
                .eq('user_id', user_id)
                .eq('notified', true)
                .order('created_at', { ascending: false })
                .limit(1);
        }

        const response = {
            data: {
                message: 'Bildirim işlemi tamamlandı',
                sent: true,
                notification_type: notification_type,
                priority: priority,
                channels: {
                    email: emailSent,
                    sms: smsSent,
                    push: pushSent
                },
                message: message,
                recipient: {
                    user_id: user_id,
                    email: user?.email || null,
                    name: user?.full_name || null
                }
            }
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Bildirim gönderme hatası:', error);
        
        const errorResponse = {
            error: {
                code: 'NOTIFICATION_ERROR',
                message: error.message || 'Bildirim gönderme sırasında bir hata oluştu'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
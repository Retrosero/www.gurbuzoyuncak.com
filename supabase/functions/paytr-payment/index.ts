Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { order_id, user_email, user_name, user_phone, user_address, items, total_amount } = await req.json();

        // PayTR Gerçek Test Configuration
        const PAYTR_CONFIG = {
            merchant_id: '406880',  // PayTR Test Merchant ID
            merchant_key: 'test123',  // PayTR Test Merchant Key
            merchant_salt: 'test123',  // PayTR Test Merchant Salt
            test_mode: '1',  // Test mode aktif
            merchant_ok_url: 'https://4twdcv2hx8ps.space.minimax.io/odeme-basarili',
            merchant_fail_url: 'https://4twdcv2hx8ps.space.minimax.io/odeme-basarisiz'
        };

        // Sipariş numarası oluştur
        const merchant_oid = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Kullanıcı IP (test için sabit IP)
        const user_ip = '127.0.0.1';
        
        // Sepet içeriği (PayTR formatında base64 encode)
        const user_basket = items.map((item: any) => [
            item.product_name,
            item.unit_price.toFixed(2),
            item.quantity
        ]);
        const user_basket_json = JSON.stringify(user_basket);
        const user_basket_base64 = btoa(unescape(encodeURIComponent(user_basket_json)));

        // Ödeme tutarı (kuruş cinsinden)
        const payment_amount = Math.round(total_amount * 100);
        
        // PayTR için hash oluşturma (HMAC-SHA256)
        const hashSTR = `${PAYTR_CONFIG.merchant_id}${user_ip}${merchant_oid}${user_email}${payment_amount}${user_basket_base64}no_installment0TRY${PAYTR_CONFIG.test_mode}${PAYTR_CONFIG.merchant_salt}`;
        
        // HMAC-SHA256 hash hesaplama
        const encoder = new TextEncoder();
        const keyData = encoder.encode(PAYTR_CONFIG.merchant_key);
        const messageData = encoder.encode(hashSTR);
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const paytr_token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // PayTR API'ye POST isteği
        const formData = new URLSearchParams();
        formData.append('merchant_id', PAYTR_CONFIG.merchant_id);
        formData.append('user_ip', user_ip);
        formData.append('merchant_oid', merchant_oid);
        formData.append('email', user_email);
        formData.append('payment_amount', payment_amount.toString());
        formData.append('paytr_token', paytr_token);
        formData.append('user_basket', user_basket_base64);
        formData.append('debug_on', '1');
        formData.append('no_installment', '0');
        formData.append('max_installment', '0');
        formData.append('user_name', user_name);
        formData.append('user_address', user_address);
        formData.append('user_phone', user_phone);
        formData.append('merchant_ok_url', PAYTR_CONFIG.merchant_ok_url);
        formData.append('merchant_fail_url', PAYTR_CONFIG.merchant_fail_url);
        formData.append('timeout_limit', '30');
        formData.append('currency', 'TRY');
        formData.append('test_mode', PAYTR_CONFIG.test_mode);
        formData.append('lang', 'tr');

        console.log('PayTR API isteği gönderiliyor:', {
            merchant_id: PAYTR_CONFIG.merchant_id,
            merchant_oid,
            amount: payment_amount,
            test_mode: PAYTR_CONFIG.test_mode
        });

        // PayTR API çağrısı
        const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const paytrResult = await paytrResponse.json();
        
        console.log('PayTR API yanıtı:', paytrResult);

        // PayTR yanıtını kontrol et
        if (paytrResult.status === 'success' && paytrResult.token) {
            // Supabase'e sipariş kaydı
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            const supabaseUrl = Deno.env.get('SUPABASE_URL');

            if (serviceRoleKey && supabaseUrl && order_id) {
                await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_number: merchant_oid,
                        payment_method: 'paytr_test',
                        payment_status: 'pending',
                        updated_at: new Date().toISOString()
                    })
                });
            }

            return new Response(JSON.stringify({
                data: {
                    status: 'success',
                    token: paytrResult.token,
                    merchant_oid: merchant_oid,
                    test_mode: true,
                    iframe_url: `https://www.paytr.com/odeme/guvenli/${paytrResult.token}`,
                    message: 'PayTR ödeme sayfası hazır'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            // PayTR hata döndü
            throw new Error(paytrResult.reason || 'PayTR token alınamadı');
        }

    } catch (error) {
        console.error('PayTR payment error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'PAYTR_PAYMENT_FAILED',
                message: `Ödeme başlatılamadı: ${error.message}`,
                details: error.toString()
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

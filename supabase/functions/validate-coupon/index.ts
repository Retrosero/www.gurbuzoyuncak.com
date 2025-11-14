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
        const { 
            coupon_code, 
            cart_total, 
            user_id = null,
            customer_type = 'B2C',
            category_ids = []
        } = await req.json();

        if (!coupon_code) {
            throw new Error('Kupon kodu gerekli');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // 1. Kuponu bul
        const couponRes = await fetch(
            `${supabaseUrl}/rest/v1/coupons?code=eq.${coupon_code.toUpperCase()}&select=*`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );
        const coupons = await couponRes.json();

        if (!coupons || coupons.length === 0) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Geçersiz kupon kodu'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const coupon = coupons[0];

        // 2. Aktiflik kontrolü
        if (!coupon.is_active) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Bu kupon artık geçerli değil'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 3. Tarih kontrolü
        const now = new Date();
        const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
        const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

        if (startDate && now < startDate) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Bu kupon henüz geçerli değil'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (endDate && now > endDate) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Bu kuponun geçerlilik süresi dolmuş'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 4. Genel kullanım limiti kontrolü
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return new Response(JSON.stringify({
                valid: false,
                error: 'Bu kuponun kullanım limiti dolmuş'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 5. Müşteri tipi kontrolü
        if (coupon.customer_types && coupon.customer_types.length > 0) {
            if (!coupon.customer_types.includes(customer_type)) {
                return new Response(JSON.stringify({
                    valid: false,
                    error: 'Bu kupon sizin müşteri tipiniz için geçerli değil'
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 6. Minimum tutar kontrolü
        if (coupon.min_purchase_amount && cart_total < parseFloat(coupon.min_purchase_amount)) {
            return new Response(JSON.stringify({
                valid: false,
                error: `Bu kupon minimum ${coupon.min_purchase_amount} TL alışveriş için geçerlidir`
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 7. Kullanıcı başına kullanım limiti kontrolü
        if (user_id && coupon.per_user_limit) {
            const usageRes = await fetch(
                `${supabaseUrl}/rest/v1/coupon_usage?coupon_id=eq.${coupon.id}&user_id=eq.${user_id}&select=id`,
                {
                    headers: {
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`
                    }
                }
            );
            const userUsage = await usageRes.json();

            if (userUsage && userUsage.length >= coupon.per_user_limit) {
                return new Response(JSON.stringify({
                    valid: false,
                    error: 'Bu kuponu kullanım hakkınız dolmuş'
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 8. Kategori kontrolü (varsa)
        if (coupon.category_ids && coupon.category_ids.length > 0) {
            const hasMatchingCategory = category_ids.some(catId => 
                coupon.category_ids.includes(catId)
            );
            
            if (!hasMatchingCategory) {
                return new Response(JSON.stringify({
                    valid: false,
                    error: 'Bu kupon seçili ürünler için geçerli değil'
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 9. İndirim miktarını hesapla
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = (cart_total * parseFloat(coupon.discount_value)) / 100;
        } else if (coupon.discount_type === 'fixed') {
            discountAmount = parseFloat(coupon.discount_value);
        }

        // İndirim sepet tutarından fazla olamaz
        discountAmount = Math.min(discountAmount, cart_total);

        return new Response(JSON.stringify({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: discountAmount,
                description: coupon.description
            },
            message: 'Kupon başarıyla uygulandı'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Kupon validasyon hatası:', error);

        return new Response(JSON.stringify({
            valid: false,
            error: error.message || 'Kupon doğrulanamadı'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

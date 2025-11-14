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
        const { items, shipping_address, billing_address, coupon_code } = await req.json();

        if (!items || items.length === 0) {
            throw new Error('Sipariş kalemleri gereklidir');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Yetkilendirme gerekli');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Geçersiz token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        const profileResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const profiles = await profileResponse.json();
        const customerType = profiles[0]?.customer_type || 'B2C';

        let subtotal = 0;
        let tax_amount = 0;

        for (const item of items) {
            const productResponse = await fetch(
                `${supabaseUrl}/rest/v1/products?id=eq.${item.product_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            const products = await productResponse.json();
            if (products.length === 0) {
                throw new Error(`Ürün bulunamadı: ${item.product_id}`);
            }

            const product = products[0];
            const basePrice = product.base_price;
            const taxRate = product.tax_rate;
            
            const itemSubtotal = basePrice * item.quantity;
            const itemTax = (itemSubtotal * taxRate) / 100;
            
            subtotal += itemSubtotal;
            tax_amount += itemTax;
        }

        let discount_amount = 0;
        if (coupon_code) {
            const couponResponse = await fetch(
                `${supabaseUrl}/rest/v1/coupons?code=eq.${coupon_code}&is_active=eq.true`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            const coupons = await couponResponse.json();
            if (coupons.length > 0) {
                const coupon = coupons[0];
                if (coupon.discount_type === 'percentage') {
                    discount_amount = ((subtotal + tax_amount) * coupon.discount_value) / 100;
                } else {
                    discount_amount = coupon.discount_value;
                }

                await fetch(`${supabaseUrl}/rest/v1/coupons?id=eq.${coupon.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        used_count: coupon.used_count + 1
                    })
                });
            }
        }

        const total_amount = subtotal + tax_amount - discount_amount;

        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const orderData = {
            order_number: orderNumber,
            user_id: userId,
            customer_type: customerType,
            subtotal,
            tax_amount,
            discount_amount,
            total_amount,
            coupon_code: coupon_code || null,
            payment_method: 'online',
            payment_status: 'pending',
            order_status: 'pending',
            shipping_address: JSON.stringify(shipping_address),
            billing_address: JSON.stringify(billing_address)
        };

        const createOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!createOrderResponse.ok) {
            const errorText = await createOrderResponse.text();
            throw new Error(`Sipariş oluşturulamadı: ${errorText}`);
        }

        const orderResult = await createOrderResponse.json();
        const orderId = orderResult[0].id;

        for (const item of items) {
            const productResponse = await fetch(
                `${supabaseUrl}/rest/v1/products?id=eq.${item.product_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            const products = await productResponse.json();
            const product = products[0];

            const unitPrice = product.base_price * (1 + product.tax_rate / 100);
            const totalPrice = unitPrice * item.quantity;

            await fetch(`${supabaseUrl}/rest/v1/order_items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: orderId,
                    product_id: item.product_id,
                    variant_id: item.variant_id || null,
                    product_name: product.name,
                    quantity: item.quantity,
                    unit_price: product.base_price,
                    tax_rate: product.tax_rate,
                    total_price: totalPrice
                })
            });

            await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.product_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stock: product.stock - item.quantity
                })
            });
        }

        const loyaltyPoints = Math.floor(total_amount / 10);
        if (loyaltyPoints > 0) {
            await fetch(`${supabaseUrl}/rest/v1/loyalty_rewards`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    points: loyaltyPoints,
                    transaction_type: 'earned',
                    order_id: orderId,
                    description: `Sipariş No: ${orderNumber} - Kazanılan puan`
                })
            });

            if (profiles[0]) {
                await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        loyalty_points: (profiles[0].loyalty_points || 0) + loyaltyPoints
                    })
                });
            }
        }

        return new Response(JSON.stringify({
            data: {
                order_id: orderId,
                order_number: orderNumber,
                total_amount,
                loyalty_points_earned: loyaltyPoints
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Order creation error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'ORDER_CREATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

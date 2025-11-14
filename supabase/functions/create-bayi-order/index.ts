// Create Bayi Order Edge Function
// Bayi toplu sipariş oluşturma ve bakiye yönetimi

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
        const requestData = await req.json();
        const { items, bayi_id, total_amount } = requestData;

        // Validation
        if (!bayi_id || !items || items.length === 0) {
            throw new Error('Geçersiz sipariş verisi');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        // Bayi kontrolü
        const bayiResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&user_id=eq.${bayi_id}`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        const bayiData = await bayiResponse.json();
        if (!bayiData || bayiData.length === 0) {
            throw new Error('Bayi bulunamadı');
        }

        const bayi = bayiData[0];
        // Bayi kontrolü - is_bayi veya B2B customer_type olabilir
        if (!bayi.is_bayi && !['B2B', 'Toptan', 'Kurumsal'].includes(bayi.customer_type)) {
            throw new Error('Geçerli bayi hesabı gerekli');
        }

        // Mevcut bakiye kontrolü
        const balanceResponse = await fetch(
            `${supabaseUrl}/rest/v1/balance_transactions?select=balance_after&user_id=eq.${bayi_id}&order=created_at.desc&limit=1`,
            {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        const balanceData = await balanceResponse.json();
        const currentBalance = balanceData.length > 0 ? parseFloat(balanceData[0].balance_after) : 0;
        
        if (currentBalance < total_amount) {
            throw new Error('Yetersiz bakiye. Lütfen bakiye yükleyin.');
        }

        // Stok kontrolü
        for (const item of items) {
            const productResponse = await fetch(
                `${supabaseUrl}/rest/v1/products?select=stock,name&id=eq.${item.product_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const productData = await productResponse.json();
            if (!productData || productData.length === 0) {
                throw new Error(`Ürün bulunamadı: ${item.product_id}`);
            }

            const product = productData[0];
            if (product.stock < item.quantity) {
                throw new Error(`Yetersiz stok. ${product.name} için ${item.quantity} adet mevcut değil.`);
            }
        }

        // Sipariş oluştur
        const orderData = {
            user_id: bayi_id,
            status: 'confirmed',
            payment_method: 'balance',
            total_amount: total_amount,
            shipping_address: 'Bayi Toplu Sipariş',
            notes: `Bayi ${bayi.dealer_company_name} toplu siparişi`
        };

        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        const orderResult = await orderResponse.json();
        const order = orderResult[0];

        // Sipariş kalemlerini oluştur
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            total_price: item.price * item.quantity
        }));

        await fetch(`${supabaseUrl}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderItems)
        });

        // Stok güncelleme
        for (const item of items) {
            // Mevcut stok bilgisini al
            const productResponse = await fetch(
                `${supabaseUrl}/rest/v1/products?select=stock&id=eq.${item.product_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const productData = await productResponse.json();
            const currentStock = productData[0].stock;
            
            // Stoku güncelle
            await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.product_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stock: currentStock - item.quantity
                })
            });
        }

        // Bakiye işlemi oluştur
        const balanceTransaction = {
            user_id: bayi_id,
            transaction_type: 'purchase',
            amount: -total_amount,
            balance_before: currentBalance,
            balance_after: currentBalance - total_amount,
            description: `Toplu sipariş #${order.id}`,
            reference_id: order.id.toString(),
            status: 'completed'
        };

        await fetch(`${supabaseUrl}/rest/v1/balance_transactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(balanceTransaction)
        });

        // Bayi siparişi kaydı oluştur
        const bayiOrderData = {
            order_id: order.id,
            bayi_id: bayi_id,
            bayi_discount_percentage: bayi.bayi_discount_percentage,
            original_total: items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0),
            discounted_total: total_amount
        };

        await fetch(`${supabaseUrl}/rest/v1/bayi_orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bayiOrderData)
        });

        // Hesap güncelleme (VIP seviye artışı için)
        const totalPurchasesResponse = await fetch(
            `${supabaseUrl}/rest/v1/bayi_orders?select=discounted_total&bayi_id=eq.${bayi_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        const totalPurchasesData = await totalPurchasesResponse.json();
        const totalPurchases = totalPurchasesData.reduce((sum: number, order: any) => 
            sum + parseFloat(order.discounted_total), 0
        );

        // VIP seviye hesaplama
        let newVipLevel = 1;
        if (totalPurchases >= 100000) newVipLevel = 5;      // ELMAS
        else if (totalPurchases >= 50000) newVipLevel = 4;  // PLATİN
        else if (totalPurchases >= 25000) newVipLevel = 3;  // ALTIN
        else if (totalPurchases >= 10000) newVipLevel = 2;  // GÜMÜŞ

        if (newVipLevel > bayi.vip_level) {
            await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${bayi_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vip_level: newVipLevel
                })
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                order_id: order.id,
                total_amount: total_amount,
                remaining_balance: currentBalance - total_amount,
                items_count: items.length,
                new_vip_level: newVipLevel,
                vip_level_changed: newVipLevel > bayi.vip_level
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Create bayi order error:', error);
        
        const errorResponse = {
            success: false,
            error: {
                code: 'CREATE_BAYI_ORDER_ERROR',
                message: error.message || 'Sipariş oluşturulurken hata oluştu'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
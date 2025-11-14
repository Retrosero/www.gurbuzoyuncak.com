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
        const { product_id, customer_type = 'B2C', quantity = 1 } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // 1. Ürün bilgisini al
        const productRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product_id}&select=*`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
            }
        });
        const products = await productRes.json();
        
        if (!products || products.length === 0) {
            throw new Error('Ürün bulunamadı');
        }

        const product = products[0];
        
        if (!product || !product.base_price) {
            throw new Error(`Ürün bilgisi hatalı: ${JSON.stringify(product)}`);
        }
        
        let basePrice = parseFloat(product.base_price);
        const categoryId = product.category_id;

        // İndirim detayları
        const discounts: any[] = [];

        // 2. Müşteri tipi indirimi
        const pricingRuleRes = await fetch(
            `${supabaseUrl}/rest/v1/pricing_rules?customer_type=eq.${customer_type}&is_active=eq.true&order=priority.desc&limit=1`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );
        const pricingRules = await pricingRuleRes.json();

        let customerTypeDiscount = 0;
        if (pricingRules && pricingRules.length > 0) {
            customerTypeDiscount = parseFloat(pricingRules[0].discount_percentage || 0);
            if (customerTypeDiscount > 0) {
                discounts.push({
                    type: 'customer_type',
                    name: `${customer_type} İndirimi`,
                    percentage: customerTypeDiscount,
                    amount: (basePrice * customerTypeDiscount) / 100
                });
            }
        }

        // 3. Kategori indirimi
        if (categoryId) {
            const now = new Date().toISOString();
            const categoryDiscountRes = await fetch(
                `${supabaseUrl}/rest/v1/category_discounts?category_id=eq.${categoryId}&is_active=eq.true`,
                {
                    headers: {
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`
                    }
                }
            );
            const categoryDiscounts = await categoryDiscountRes.json();

            for (const cd of categoryDiscounts) {
                const startOk = !cd.start_date || new Date(cd.start_date) <= new Date(now);
                const endOk = !cd.end_date || new Date(cd.end_date) >= new Date(now);
                const customerTypeOk = !cd.customer_types || cd.customer_types.includes(customer_type);

                if (startOk && endOk && customerTypeOk) {
                    const percentage = parseFloat(cd.discount_percentage);
                    const priceAfterCustomerDiscount = basePrice - (basePrice * customerTypeDiscount) / 100;
                    discounts.push({
                        type: 'category',
                        name: 'Kategori İndirimi',
                        percentage: percentage,
                        amount: (priceAfterCustomerDiscount * percentage) / 100
                    });
                    break; // İlk geçerli kategori indirimini al
                }
            }
        }

        // 4. Ürün indirimi
        const productDiscountRes = await fetch(
            `${supabaseUrl}/rest/v1/product_discounts?product_id=eq.${product_id}&is_active=eq.true`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );
        const productDiscounts = await productDiscountRes.json();

        if (productDiscounts && productDiscounts.length > 0) {
            const now = new Date().toISOString();
            for (const pd of productDiscounts) {
                const startOk = !pd.start_date || new Date(pd.start_date) <= new Date(now);
                const endOk = !pd.end_date || new Date(pd.end_date) >= new Date(now);
                const customerTypeOk = !pd.customer_types || pd.customer_types.includes(customer_type);

                if (startOk && endOk && customerTypeOk) {
                    const percentage = parseFloat(pd.discount_percentage);
                    let priceAfterPrevDiscounts = basePrice;
                    discounts.forEach(d => {
                        priceAfterPrevDiscounts -= d.amount;
                    });
                    discounts.push({
                        type: 'product',
                        name: 'Ürün İndirimi',
                        percentage: percentage,
                        amount: (priceAfterPrevDiscounts * percentage) / 100
                    });
                    break;
                }
            }
        }

        // 5. Aktif kampanyalar (seasonal, category, product)
        const now = new Date().toISOString();
        const campaignsRes = await fetch(
            `${supabaseUrl}/rest/v1/campaigns?is_active=eq.true&start_date=lte.${now}&end_date=gte.${now}&order=priority.desc`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );
        const campaigns = await campaignsRes.json();

        for (const campaign of campaigns) {
            // Müşteri tipi kontrolü
            if (campaign.customer_types && !campaign.customer_types.includes(customer_type)) {
                continue;
            }

            // Kampanya tiplerine göre işle
            if (campaign.campaign_type === 'seasonal') {
                // Tüm ürünlere geçerli
                const percentage = parseFloat(campaign.discount_value || 0);
                let priceAfterPrevDiscounts = basePrice;
                discounts.forEach(d => {
                    priceAfterPrevDiscounts -= d.amount;
                });
                discounts.push({
                    type: 'campaign',
                    name: campaign.name,
                    percentage: percentage,
                    amount: (priceAfterPrevDiscounts * percentage) / 100,
                    campaign_id: campaign.id
                });
                break; // En yüksek öncelikli kampanyayı al
            } else if (campaign.campaign_type === 'category') {
                if (campaign.category_ids && campaign.category_ids.includes(categoryId)) {
                    const percentage = parseFloat(campaign.discount_value || 0);
                    let priceAfterPrevDiscounts = basePrice;
                    discounts.forEach(d => {
                        priceAfterPrevDiscounts -= d.amount;
                    });
                    discounts.push({
                        type: 'campaign',
                        name: campaign.name,
                        percentage: percentage,
                        amount: (priceAfterPrevDiscounts * percentage) / 100,
                        campaign_id: campaign.id
                    });
                    break;
                }
            } else if (campaign.campaign_type === 'product') {
                if (campaign.product_ids && campaign.product_ids.includes(product_id)) {
                    const percentage = parseFloat(campaign.discount_value || 0);
                    let priceAfterPrevDiscounts = basePrice;
                    discounts.forEach(d => {
                        priceAfterPrevDiscounts -= d.amount;
                    });
                    discounts.push({
                        type: 'campaign',
                        name: campaign.name,
                        percentage: percentage,
                        amount: (priceAfterPrevDiscounts * percentage) / 100,
                        campaign_id: campaign.id
                    });
                    break;
                }
            }
        }

        // Final fiyat hesaplama
        const totalDiscountAmount = discounts.reduce((sum, d) => sum + d.amount, 0);
        const finalPrice = Math.max(0, basePrice - totalDiscountAmount);
        const totalDiscountPercentage = basePrice > 0 ? ((totalDiscountAmount / basePrice) * 100) : 0;

        return new Response(JSON.stringify({
            data: {
                product_id: product_id,
                base_price: basePrice,
                final_price: finalPrice,
                total_discount_amount: totalDiscountAmount,
                total_discount_percentage: Math.round(totalDiscountPercentage),
                customer_type: customer_type,
                discounts: discounts,
                quantity: quantity
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Fiyat hesaplama hatası:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'PRICE_CALCULATION_FAILED',
                message: `Fiyat hesaplanamadı: ${error.message}`
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

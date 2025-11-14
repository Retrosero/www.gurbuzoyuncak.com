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
        const { reportType, dateFrom, dateTo, filters } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        let reportData = {};
        const timestamp = new Date().toISOString();

        // Tarih filtreleri
        const defaultDateFrom = new Date();
        defaultDateFrom.setDate(defaultDateFrom.getDate() - 30); // Son 30 gün
        
        const fromDate = dateFrom || defaultDateFrom.toISOString().split('T')[0];
        const toDate = dateTo || new Date().toISOString().split('T')[0];

        switch (reportType) {
            case 'sales':
                // Satış raporu
                const salesResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=*,order_items(*,products(*))&created_at=gte.${fromDate}&created_at=lte.${toDate}T23:59:59`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    }
                });

                if (!salesResponse.ok) throw new Error('Satış verileri alınamadı');
                const sales = await salesResponse.json();

                const salesSummary = {
                    totalOrders: sales.length,
                    totalRevenue: sales.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
                    averageOrderValue: sales.length > 0 ? sales.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) / sales.length : 0,
                    ordersByStatus: sales.reduce((acc, order) => {
                        acc[order.status] = (acc[order.status] || 0) + 1;
                        return acc;
                    }, {}),
                    dailySales: sales.reduce((acc, order) => {
                        const date = order.created_at.split('T')[0];
                        acc[date] = (acc[date] || 0) + parseFloat(order.total_amount || 0);
                        return acc;
                    }, {}),
                    topProducts: {}
                };

                // En çok satan ürünler
                sales.forEach(order => {
                    order.order_items?.forEach(item => {
                        const productId = item.product_id;
                        if (!salesSummary.topProducts[productId]) {
                            salesSummary.topProducts[productId] = {
                                name: item.products?.name || 'Bilinmeyen Ürün',
                                totalSold: 0,
                                revenue: 0
                            };
                        }
                        salesSummary.topProducts[productId].totalSold += item.quantity;
                        salesSummary.topProducts[productId].revenue += parseFloat(item.price || 0) * item.quantity;
                    });
                });

                reportData = {
                    type: 'sales',
                    period: { from: fromDate, to: toDate },
                    summary: salesSummary,
                    rawData: sales,
                    generatedAt: timestamp
                };
                break;

            case 'stock':
                // Stok raporu
                const stockResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=*,product_variants(*)`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    }
                });

                if (!stockResponse.ok) throw new Error('Stok verileri alınamadı');
                const products = await stockResponse.json();

                const stockSummary = {
                    totalProducts: products.length,
                    lowStockProducts: products.filter(p => (p.stock_quantity || 0) < 10),
                    outOfStockProducts: products.filter(p => (p.stock_quantity || 0) <= 0),
                    stockByCategory: {},
                    totalStockValue: 0
                };

                products.forEach(product => {
                    // Kategori bazlı stok
                    const category = product.category?.name || 'Diğer';
                    if (!stockSummary.stockByCategory[category]) {
                        stockSummary.stockByCategory[category] = {
                            count: 0,
                            totalStock: 0,
                            totalValue: 0
                        };
                    }
                    stockSummary.stockByCategory[category].count++;
                    stockSummary.stockByCategory[category].totalStock += product.stock_quantity || 0;
                    stockSummary.stockByCategory[category].totalValue += (product.stock_quantity || 0) * parseFloat(product.price || 0);

                    // Toplam stok değeri
                    stockSummary.totalStockValue += (product.stock_quantity || 0) * parseFloat(product.price || 0);
                });

                reportData = {
                    type: 'stock',
                    period: { from: fromDate, to: toDate },
                    summary: stockSummary,
                    rawData: products,
                    generatedAt: timestamp
                };
                break;

            case 'products':
                // Ürün performans raporu
                const productsResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=*,order_items(*,orders(*))`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    }
                });

                if (!productsResponse.ok) throw new Error('Ürün verileri alınamadı');
                const allProducts = await productsResponse.json();

                const productSummary = {
                    totalProducts: allProducts.length,
                    activeProducts: allProducts.filter(p => p.is_active).length,
                    inactiveProducts: allProducts.filter(p => !p.is_active).length,
                    productsByCategory: {},
                    productPerformance: {}
                };

                allProducts.forEach(product => {
                    // Kategori analizi
                    const category = product.category?.name || 'Diğer';
                    if (!productSummary.productsByCategory[category]) {
                        productSummary.productsByCategory[category] = 0;
                    }
                    productSummary.productsByCategory[category]++;

                    // Performans analizi
                    const orderItems = product.order_items || [];
                    const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
                    const totalRevenue = orderItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);

                    productSummary.productPerformance[product.id] = {
                        name: product.name,
                        totalSold,
                        totalRevenue,
                        averageOrderValue: totalSold > 0 ? totalRevenue / totalSold : 0,
                        isActive: product.is_active
                    };
                });

                reportData = {
                    type: 'products',
                    period: { from: fromDate, to: toDate },
                    summary: productSummary,
                    rawData: allProducts,
                    generatedAt: timestamp
                };
                break;

            default:
                throw new Error('Geçersiz rapor türü');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Rapor başarıyla oluşturuldu',
            data: reportData
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Rapor oluşturma hatası:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
// Bayi Products Edge Function
// Ürün listesi, filtreleme ve bayi özel fiyat hesaplama

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
        const { user_id, filters } = requestData;

        // Kullanıcı kontrolü
        if (!user_id) {
            console.error('User ID is missing:', { user_id, requestData });
            throw new Error('Kullanıcı oturumu gerekli - lütfen tekrar giriş yapın');
        }

        // Supabase client oluştur
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration');
            throw new Error('Sunucu yapılandırma hatası');
        }
        
        // Bayi bilgilerini al
        console.log('Fetching bayi info for user:', user_id);
        const bayiResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&user_id=eq.${user_id}`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        if (!bayiResponse.ok) {
            console.error('Failed to fetch bayi info:', await bayiResponse.text());
            throw new Error('Bayi bilgileri alınamadı');
        }

        const bayiData = await bayiResponse.json();
        console.log('Bayi data:', { count: bayiData?.length, data: bayiData });
        
        if (!bayiData || bayiData.length === 0) {
            throw new Error('Bayi hesabı bulunamadı - lütfen bayi olarak giriş yaptığınızdan emin olun');
        }

        const bayi = bayiData[0];
        // Bayi kontrolü - is_bayi veya B2B customer_type olabilir
        console.log('Bayi info check:', { 
            is_bayi: bayi.is_bayi, 
            customer_type: bayi.customer_type,
            bayi_status: bayi.bayi_status
        });
        
        if (!bayi.is_bayi && !['B2B', 'Toptan', 'Kurumsal'].includes(bayi.customer_type || '')) {
            throw new Error('Geçerli bayi hesabı gerekli - lütfen bayi olarak giriş yapın');
        }

        // Ürünleri çek - önce basit query ile test edelim
        console.log('Fetching products with filters:', filters);
        let query = `${supabaseUrl}/rest/v1/products?select=*&is_active=eq.true`;
        
        if (filters?.inStock) {
            query += `&stock=gt.0`;
        }
        
        if (filters?.searchQuery) {
            query += `&or=(name.ilike.*${encodeURIComponent(filters.searchQuery)}*,description.ilike.*${encodeURIComponent(filters.searchQuery)}*)`;
        }

        console.log('Products query:', query);
        
        const productsResponse = await fetch(query, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        if (!productsResponse.ok) {
            console.error('Failed to fetch products:', await productsResponse.text());
            throw new Error('Ürünler yüklenemedi');
        }

        const productsData = await productsResponse.json();
        console.log('Products fetched:', { count: productsData?.length });
        
        // Kategoriler ve markaları ayrı çek
        const [categoriesResponse, brandsResponse] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&is_active=eq.true`, {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(`${supabaseUrl}/rest/v1/brands?select=id,name&is_active=eq.true`, {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                }
            })
        ]);

        if (!categoriesResponse.ok || !brandsResponse.ok) {
            console.error('Failed to fetch categories/brands');
            throw new Error('Kategori/marka bilgileri yüklenemedi');
        }

        const categoriesData = await categoriesResponse.json();
        const brandsData = await brandsResponse.json();
        console.log('Categories/Brands fetched:', { categories: categoriesData?.length, brands: brandsData?.length });
        
        // Category ve brand lookup maps oluştur
        const categoryMap = new Map(categoriesData.map((cat: any) => [cat.id, cat.name]));
        const brandMap = new Map(brandsData.map((brand: any) => [brand.id, brand.name]));
        
        // Client-side filtering for category and brand
        let filteredProducts = productsData;
        if (filters?.category) {
            const categoryId = categoriesData.find((cat: any) => cat.name === filters.category)?.id;
            if (categoryId) {
                filteredProducts = filteredProducts.filter((p: any) => p.category_id === categoryId);
            }
        }
        
        if (filters?.brand) {
            const brandId = brandsData.find((brand: any) => brand.name === filters.brand)?.id;
            if (brandId) {
                filteredProducts = filteredProducts.filter((p: any) => p.brand_id === brandId);
            }
        }
        
        // Ürün görselleri için product_images tablosundan çek
        const productIds = filteredProducts.map((p: any) => p.id);
        const imagesResponse = await fetch(
            `${supabaseUrl}/rest/v1/product_images?select=*&product_id=in.(${productIds.join(',')})&order=order_index.asc`,
            {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        let productImagesMap = new Map();
        if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            // Group by product_id
            imagesData.forEach((img: any) => {
                if (!productImagesMap.has(img.product_id)) {
                    productImagesMap.set(img.product_id, []);
                }
                productImagesMap.get(img.product_id).push(img.image_url);
            });
        }
        
        // Bayi fiyat hesaplama
        const processedProducts = filteredProducts.map((product: any) => {
            const basePrice = parseFloat(product.base_price || 0);
            const bayiDiscount = parseFloat(bayi.bayi_discount_percentage || 0);
            const calculatedPrice = basePrice * (1 - (bayiDiscount / 100));
            const discountPercentage = bayiDiscount;
            const savingsAmount = basePrice - calculatedPrice;

            return {
                ...product,
                original_price: basePrice,
                base_price: basePrice,
                calculated_bayi_price: calculatedPrice,
                discount_percentage: discountPercentage,
                savings_amount: savingsAmount,
                category_name: categoryMap.get(product.category_id) || '',
                brand_name: brandMap.get(product.brand_id) || '',
                image_urls: productImagesMap.get(product.id) || []
            };
        });

        // Fiyat aralığı filtresi (client-side)
        let finalProducts = processedProducts;
        if (filters?.priceRange) {
            const [min, max] = filters.priceRange;
            finalProducts = processedProducts.filter((product: any) => 
                product.calculated_bayi_price >= min && product.calculated_bayi_price <= max
            );
        }

        // İstatistikler
        const stats = {
            total_products: finalProducts.length,
            total_categories: new Set(finalProducts.map((p: any) => p.category_name)).size,
            total_brands: new Set(finalProducts.map((p: any) => p.brand_name)).size,
            total_stock_value: finalProducts.reduce((sum: number, p: any) => 
                sum + (p.calculated_bayi_price * (p.stock || 0)), 0
            ),
            total_savings: finalProducts.reduce((sum: number, p: any) => 
                sum + (p.savings_amount * (p.stock || 0)), 0
            ),
            bayi_discount: bayi.bayi_discount_percentage,
            vip_level: bayi.vip_level
        };

        return new Response(JSON.stringify({
            success: true,
            data: {
                products: finalProducts,
                stats: stats,
                bayi_info: {
                    name: bayi.dealer_company_name || bayi.email,
                    discount_percentage: bayi.bayi_discount_percentage,
                    vip_level: bayi.vip_level,
                    status: bayi.bayi_status
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Bayi products error:', error);
        
        // Hata detaylarını logla
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        console.error('Error details:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        });
        
        const errorResponse = {
            success: false,
            error: {
                code: 'BAYI_PRODUCTS_ERROR',
                message: errorMessage || 'Ürünler yüklenirken hata oluştu',
                details: error instanceof Error ? error.stack : undefined
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

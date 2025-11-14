Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Tüm aktif scheduled task'ları al
        const tasksResponse = await fetch(`${supabaseUrl}/rest/v1/xml_scheduled_tasks?is_active=eq.true&status=neq.disabled`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!tasksResponse.ok) {
            throw new Error('Scheduled task\'lar alınamadı');
        }

        const tasks = await tasksResponse.json();
        console.log(`${tasks.length} aktif task bulundu`);

        const results = [];

        for (const task of tasks) {
            console.log(`Task işleniyor: ${task.name} (${task.id})`);
            
            // Her task için işlem başlat
            const taskResult = await processXmlTask(task, serviceRoleKey, supabaseUrl);
            results.push(taskResult);
        }

        return new Response(JSON.stringify({
            data: {
                processed_tasks: results.length,
                results: results,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('XML cron job error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'XML_CRON_JOB_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// XML task işleme fonksiyonu
async function processXmlTask(task: any, serviceRoleKey: string, supabaseUrl: string) {
    const startTime = Date.now();
    let historyId = null;

    try {
        // Task'ı running olarak güncelle
        await updateTaskStatus(task.id, 'running', serviceRoleKey, supabaseUrl);

        // Geçmiş kaydı oluştur
        const historyResponse = await fetch(`${supabaseUrl}/rest/v1/xml_pull_history`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                task_id: task.id,
                status: 'running'
            })
        });

        if (historyResponse.ok) {
            const history = await historyResponse.json();
            historyId = history[0].id;
        }

        console.log(`XML çekiliyor: ${task.xml_url}`);

        // XML'i çek
        const xmlResponse = await fetch(task.xml_url, {
            headers: {
                'User-Agent': 'Gurbuz-Oyuncak-XML-Puller/1.0'
            }
        });

        if (!xmlResponse.ok) {
            throw new Error(`XML çekilemedi: HTTP ${xmlResponse.status}`);
        }

        const xmlContent = await xmlResponse.text();
        console.log(`XML içeriği alındı: ${xmlContent.length} karakter`);

        // XML'i parse et ve işle
        const processingResult = await processXmlContent(xmlContent, serviceRoleKey, supabaseUrl);

        // Başarılı işlem sonrası güncelleme
        const nextRun = calculateNextRun(task.schedule_cron);
        await updateTaskStatus(task.id, 'success', serviceRoleKey, supabaseUrl, {
            last_run: new Date().toISOString(),
            next_run: nextRun,
            retry_count: 0,
            last_error: null
        });

        // Geçmişi güncelle
        if (historyId) {
            await updateHistoryStatus(historyId, 'success', {
                products_processed: processingResult.total,
                products_imported: processingResult.imported,
                products_failed: processingResult.failed,
                execution_time_ms: Date.now() - startTime,
                response_data: processingResult
            }, serviceRoleKey, supabaseUrl);
        }

        console.log(`Task başarılı: ${task.name}`);

        return {
            task_id: task.id,
            task_name: task.name,
            status: 'success',
            processed_products: processingResult.total,
            imported_products: processingResult.imported,
            failed_products: processingResult.failed,
            execution_time_ms: Date.now() - startTime
        };

    } catch (error) {
        console.error(`Task hatası: ${task.name}`, error);

        // Retry mekanizması
        const newRetryCount = (task.retry_count || 0) + 1;
        const shouldRetry = newRetryCount < (task.max_retries || 3);
        
        const newStatus = shouldRetry ? 'pending' : 'failed';
        const statusUpdate: any = {
            retry_count: newRetryCount,
            last_error: error.message
        };

        if (!shouldRetry) {
            statusUpdate.status = 'failed';
        }

        await updateTaskStatus(task.id, newStatus, serviceRoleKey, supabaseUrl, statusUpdate);

        // Geçmişi güncelle
        if (historyId) {
            await updateHistoryStatus(historyId, 'failed', {
                error_message: error.message,
                execution_time_ms: Date.now() - startTime,
                response_data: { error: error.message }
            }, serviceRoleKey, supabaseUrl);
        }

        return {
            task_id: task.id,
            task_name: task.name,
            status: 'failed',
            error: error.message,
            retry_count: newRetryCount,
            should_retry: shouldRetry,
            execution_time_ms: Date.now() - startTime
        };
    }
}

// Task durumunu güncelle
async function updateTaskStatus(taskId: number, status: string, serviceRoleKey: string, supabaseUrl: string, additionalUpdate: any = {}) {
    const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalUpdate
    };

    await fetch(`${supabaseUrl}/rest/v1/xml_scheduled_tasks?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
}

// Geçmiş kaydını güncelle
async function updateHistoryStatus(historyId: number, status: string, additionalData: any, serviceRoleKey: string, supabaseUrl: string) {
    const updateData = {
        status,
        ...additionalData
    };

    await fetch(`${supabaseUrl}/rest/v1/xml_pull_history?id=eq.${historyId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
}

// XML içeriğini işle (mevcut xml-product-upload fonksiyonundan uyarlanmış)
async function processXmlContent(xmlContent: string, serviceRoleKey: string, supabaseUrl: string) {
    // XML parse fonksiyonu - Regex kullanarak
    function parseXML(xml: string) {
        const products = [];
        const productMatches = xml.matchAll(/<Product>([\s\S]*?)<\/Product>/g);

        for (const match of productMatches) {
            const productXML = match[1];
            
            // Alan değerini temizle ve decode et
            const cleanField = (value: string): string => {
                if (!value) return '';
                
                // HTML entity'leri decode et
                let cleaned = value
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/&#39;/g, "'")
                    .replace(/&#x27;/g, "'");
                
                // Extra bracket'ları ve whitespace'leri temizle
                cleaned = cleaned
                    .replace(/^\[+/, '')  // Başlangıçtaki bracket'lar
                    .replace(/\]+$/, '')  // Sondaki bracket'lar
                    .trim();
                
                return cleaned;
            };
            
            const getField = (fieldName: string): string => {
                // CDATA veya normal içerik
                const regex = new RegExp(`<${fieldName}>(?:<!\[CDATA\[\s*(.*?)\s*\]\]>|(.*?))<\/${fieldName}>`, 's');
                const fieldMatch = productXML.match(regex);
                const rawValue = fieldMatch ? (fieldMatch[1] || fieldMatch[2] || '') : '';
                
                // Temizle ve döndür
                return cleanField(rawValue);
            };

            products.push({
                product_code: getField('Product_code'),
                product_id: getField('Product_id'),
                barcode: getField('Barcode'),
                mpn: getField('mpn'),
                shelf_code: getField('rafno'),
                variant_name: getField('alt_baslik2'),
                name: getField('Name'),
                mainCategory: getField('mainCategory'),
                mainCategory_id: getField('mainCategory_id'),
                category: getField('category'),
                category_id: getField('category_id'),
                subCategory: getField('subCategory'),
                subCategory_id: getField('subCategory_id'),
                price: getField('Price'),
                tax: getField('Tax'),
                stock: getField('Stock'),
                brand: getField('Brand'),
                origin: getField('urun_mensei'),
                image1: getField('Image1'),
                image2: getField('Image2'),
                image3: getField('Image3'),
                image4: getField('Image4'),
                width: getField('width'),
                height: getField('height'),
                depth: getField('depth'),
                desi: getField('desi'),
                weight: getField('agirlik')
            });
        }

        return products;
    }

    const parsedProducts = parseXML(xmlContent);
    let imported_count = 0;
    let failed_count = 0;
    const error_log = [];

    // Ürünleri tek tek işle
    for (const product of parsedProducts) {
        try {
            // Slug oluştur
            const slug = product.name
                .toLowerCase()
                .replace(/ş/g, 's')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/ı/g, 'i')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Kategori bul veya oluştur
            let categoryId = null;
            if (product.subCategory) {
                const catResponse = await fetch(
                    `${supabaseUrl}/rest/v1/categories?slug=eq.${encodeURIComponent(product.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );

                const categories = await catResponse.json();
                if (categories.length > 0) {
                    categoryId = categories[0].id;
                }
            }

            // Marka bul veya oluştur
            let brandId = null;
            if (product.brand) {
                const brandSlug = product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const brandResponse = await fetch(
                    `${supabaseUrl}/rest/v1/brands?slug=eq.${encodeURIComponent(brandSlug)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );

                const brands = await brandResponse.json();
                if (brands.length > 0) {
                    brandId = brands[0].id;
                } else {
                    // Yeni marka oluştur
                    const createBrandResponse = await fetch(`${supabaseUrl}/rest/v1/brands`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            name: product.brand,
                            slug: brandSlug,
                            is_active: true
                        })
                    });

                    if (createBrandResponse.ok) {
                        const newBrand = await createBrandResponse.json();
                        brandId = newBrand[0].id;
                    }
                }
            }

            // Ürünü ekle veya güncelle
            const productData = {
                product_code: product.product_code,
                barcode: product.barcode,
                mpn: product.mpn,
                shelf_code: product.shelf_code,
                name: product.name,
                slug: `${slug}-${product.product_code.toLowerCase()}`,
                brand_id: brandId,
                category_id: categoryId,
                base_price: parseFloat(product.price) || 0,
                tax_rate: parseFloat(product.tax) || 20,
                origin: product.origin,
                width: parseFloat(product.width) || null,
                height: parseFloat(product.height) || null,
                depth: parseFloat(product.depth) || null,
                desi: parseFloat(product.desi) || null,
                weight: parseFloat(product.weight) || null,
                stock: parseInt(product.stock) || 0,
                is_active: true
            };

            // Ürünün var olup olmadığını kontrol et
            const existingProductResponse = await fetch(
                `${supabaseUrl}/rest/v1/products?product_code=eq.${encodeURIComponent(product.product_code)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            const existingProducts = await existingProductResponse.json();
            let productId;

            if (existingProducts.length > 0) {
                // Güncelle
                productId = existingProducts[0].id;
                await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            } else {
                // Yeni ekle
                const createProductResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(productData)
                });

                if (createProductResponse.ok) {
                    const newProduct = await createProductResponse.json();
                    productId = newProduct[0].id;
                }
            }

            // Görselleri ekle
            if (productId) {
                const images = [product.image1, product.image2, product.image3, product.image4].filter(img => img);
                
                for (let i = 0; i < images.length; i++) {
                    await fetch(`${supabaseUrl}/rest/v1/product_images`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            product_id: productId,
                            image_url: images[i],
                            order_index: i,
                            is_primary: i === 0
                        })
                    });
                }
            }

            imported_count++;
        } catch (err) {
            failed_count++;
            error_log.push({
                product_code: product.product_code,
                error: err.message
            });
        }
    }

    return {
        total: parsedProducts.length,
        imported: imported_count,
        failed: failed_count,
        errors: error_log
    };
}

// Bir sonraki çalışma zamanını hesapla
function calculateNextRun(cronExpression: string): string {
    const now = new Date();
    
    switch (cronExpression) {
        case '0 2 * * *': // Her gün 02:00
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0);
            return tomorrow.toISOString();
            
        case '0 9 * * *': // Her gün 09:00
            const tomorrow9 = new Date(now);
            tomorrow9.setDate(tomorrow9.getDate() + 1);
            tomorrow9.setHours(9, 0, 0, 0);
            return tomorrow9.toISOString();
            
        case '0 2 * * 1': // Her hafta pazartesi 02:00
            const nextMonday = new Date(now);
            nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7);
            nextMonday.setHours(2, 0, 0, 0);
            return nextMonday.toISOString();
            
        default:
            // Varsayılan olarak yarın aynı saat
            const nextDay = new Date(now);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay.toISOString();
    }
}
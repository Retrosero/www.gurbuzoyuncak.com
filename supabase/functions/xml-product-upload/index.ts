Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-upload-id, x-cancel',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    // =====================================================
    // AKILLI ÜRÜN GÜNCELLEME SİSTEMİ
    // =====================================================

    // Memory usage kontrolü
    const getMemoryUsage = () => {
        try {
            return Math.round((performance.memory?.usedJSHeapSize || 0) / 1024 / 1024);
        } catch {
            return 0;
        }
    };

    // İki ürün arasındaki farkları hesapla
    function calculateProductDiff(oldProduct, newProduct) {
        const changedFields = {};
        let hasChanges = false;
        let priceChange = 0;
        let stockChange = 0;

        const fieldsToCompare = [
            'name', 'base_price', 'tax_rate', 'stock', 'origin', 
            'width', 'height', 'depth', 'desi', 'weight',
            'barcode', 'mpn', 'shelf_code', 'brand_id', 'category_id'
        ];

        for (const field of fieldsToCompare) {
            const oldValue = oldProduct?.[field];
            const newValue = newProduct?.[field];

            if (oldValue !== newValue) {
                hasChanges = true;
                changedFields[field] = { old: oldValue, new: newValue };

                if (field === 'base_price') {
                    priceChange = parseFloat(newValue || 0) - parseFloat(oldValue || 0);
                }
                if (field === 'stock') {
                    stockChange = parseInt(newValue || 0) - parseInt(oldValue || 0);
                }
            }
        }

        return { changedFields, hasChanges, priceChange, stockChange };
    }

    // Update log kaydı oluştur
    async function logProductUpdate(
        supabaseUrl, serviceRoleKey, productId, action, oldValues, 
        newValues, changedFields, updateReason, userId, userEmail, 
        xmlImportId, batchId, processingTime, memoryUsage, 
        priceChange = 0, stockChange = 0
    ) {
        try {
            await fetch(`${supabaseUrl}/rest/v1/products_update_log`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    action,
                    changed_fields: changedFields,
                    old_values: oldValues,
                    new_values: newValues,
                    updated_by: userId,
                    user_email: userEmail,
                    xml_import_id: xmlImportId,
                    batch_id: batchId,
                    price_change_amount: priceChange,
                    stock_change_amount: stockChange,
                    update_reason: updateReason,
                    processing_time_ms: processingTime,
                    memory_usage_mb: memoryUsage
                })
            });
        } catch (error) {
            console.error('Log kaydetme hatası:', error);
        }
    }

    // Performans metrikleri kaydet
    async function savePerformanceMetrics(
        supabaseUrl, serviceRoleKey, xmlImportId, batchNumber, batchSize,
        processingTime, memoryPeak, productsProcessed, productsUpdated,
        productsInserted, productsFailed
    ) {
        try {
            await fetch(`${supabaseUrl}/rest/v1/xml_processing_performance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    xml_import_id: xmlImportId,
                    batch_number: batchNumber,
                    batch_size: batchSize,
                    processing_time_ms: processingTime,
                    memory_peak_mb: memoryPeak,
                    products_processed: productsProcessed,
                    products_updated: productsUpdated,
                    products_inserted: productsInserted,
                    products_failed: productsFailed
                })
            });
        } catch (error) {
            console.error('Performans metrikleri kaydetme hatası:', error);
        }
    }

    // Akıllı ürün güncelleme fonksiyonu
    async function smartUpdateProduct(
        supabaseUrl, serviceRoleKey, existingProduct, newProductData,
        userId, userEmail, xmlImportId, batchId
    ) {
        const startTime = Date.now();
        const memoryUsage = getMemoryUsage();

        const diff = calculateProductDiff(existingProduct, newProductData);
        
        if (!diff.hasChanges) {
            return {
                updated: false,
                productId: existingProduct.id,
                changedFields: {},
                processingTime: Date.now() - startTime
            };
        }

        const updateData = {};
        for (const [field, changes] of Object.entries(diff.changedFields)) {
            updateData[field] = changes.new;
        }
        updateData.updated_at = new Date().toISOString();

        try {
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${existingProduct.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!updateResponse.ok) {
                throw new Error(`Güncelleme başarısız: ${updateResponse.statusText}`);
            }

            const processingTime = Date.now() - startTime;

            await logProductUpdate(
                supabaseUrl, serviceRoleKey, existingProduct.id, 'update',
                diff.changedFields, updateData, diff.changedFields,
                diff.priceChange !== 0 && diff.stockChange !== 0 ? 'mixed_update' : 
                diff.priceChange !== 0 ? 'price_update' : 
                diff.stockChange !== 0 ? 'stock_update' : 'info_update',
                userId, userEmail, xmlImportId, batchId, processingTime,
                memoryUsage, diff.priceChange, diff.stockChange
            );

            return {
                updated: true,
                productId: existingProduct.id,
                changedFields: diff.changedFields,
                processingTime
            };

        } catch (error) {
            console.error('Akıllı güncelleme hatası:', error);
            throw error;
        }
    }

    // Cancellation endpoint
    if (req.method === 'DELETE' || req.method === 'POST') {
        const { uploadId } = await req.json();
        
        if (!uploadId) {
            throw new Error('Upload ID gerekli');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        const cancelResponse = await fetch(`${supabaseUrl}/rest/v1/xml_imports?id=eq.${uploadId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                status_message: 'İptal edildi',
                current_stage: 'cancelled'
            })
        });

        if (!cancelResponse.ok) {
            throw new Error('İptal işlemi başarısız');
        }

        console.log(`[XML-UPLOAD] ${uploadId} - Upload iptal edildi (Smart Update System v2.0)`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Upload işlemi iptal edildi'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const { xmlContent, filename, uploadId } = await req.json();
        
        // Dosya boyutu kontrolü (5MB limit)
        const xmlContentBytes = new TextEncoder().encode(xmlContent);
        const fileSizeInMB = xmlContentBytes.length / (1024 * 1024);
        const MAX_FILE_SIZE_MB = 5;
        
        if (fileSizeInMB > MAX_FILE_SIZE_MB) {
            throw new Error(`Dosya boyutu çok büyük! Maksimum ${MAX_FILE_SIZE_MB}MB yükleyebilirsiniz. (${fileSizeInMB.toFixed(2)}MB)`);
        }
        
        // XML syntax validation
        if (!xmlContent.includes('<Products>') || !xmlContent.includes('</Products>')) {
            throw new Error('Geçersiz XML formatı! <Products> root elementi bulunamadı.');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Kullanıcı doğrulama
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

        // XML import kaydı oluştur
        const importRecordResponse = await fetch(`${supabaseUrl}/rest/v1/xml_imports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                filename,
                status: 'processing',
                imported_by: userId
            })
        });

        if (!importRecordResponse.ok) {
            throw new Error('Import kaydı oluşturulamadı');
        }

        const importRecord = await importRecordResponse.json();
        const importId = importRecord[0].id;

        // Progress tracking fonksiyonu
        async function updateProgress(stage, current, total, message = '') {
            const progress = total > 0 ? Math.round((current / total) * 100) : 0;
            const memoryUsage = getMemoryUsage();
            
            const progressData = {
                stage,
                current,
                total,
                progress: Math.min(progress, 100),
                message,
                timestamp: new Date().toISOString(),
                memoryUsage
            };

            console.log(`[XML-UPLOAD] ${importId} - ${stage}: ${current}/${total} (${progress}%) ${message}`);
            
            await fetch(`${supabaseUrl}/rest/v1/xml_imports?id=eq.${importId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_stage: stage,
                    progress_percentage: progress,
                    memory_usage: memoryUsage,
                    last_progress_update: new Date().toISOString(),
                    status_message: message || stage
                })
            });
        }

        // Cancellation check
        async function checkCancellation() {
            const cancelResponse = await fetch(`${supabaseUrl}/rest/v1/xml_imports?id=eq.${importId}&select=status`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            const cancelData = await cancelResponse.json();
            return cancelData[0]?.status === 'cancelled';
        }

        // XML parse fonksiyonu
        function parseXML(xml) {
            const products = [];
            const productMatches = xml.matchAll(/<Product>([\s\S]*?)<\/Product>/g);
            let totalProducts = 0;
            for (const _ of productMatches) {
                totalProducts++;
            }
            let processedCount = 0;
            
            const matches = xml.matchAll(/<Product>([\s\S]*?)<\/Product>/g);
            
            for (const match of matches) {
                processedCount++;
                
                if (await checkCancellation()) {
                    throw new Error('Upload işlemi iptal edildi');
                }
                
                if (processedCount % 10 === 0 || processedCount === totalProducts) {
                    await updateProgress('parsing', processedCount, totalProducts, `${processedCount}/${totalProducts} ürün ayrıştırıldı`);
                }
                
                const productXML = match[1];
                
                const cleanField = (value) => {
                    if (!value) return '';
                    
                    let cleaned = value
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&apos;/g, "'")
                        .replace(/&#39;/g, "'")
                        .replace(/&#x27;/g, "'");
                    
                    cleaned = cleaned
                        .replace(/^\[+/, '')
                        .replace(/\]+$/, '')
                        .trim();
                    
                    return cleaned;
                };
                
                const getField = (fieldName) => {
                    const regex = new RegExp(`<${fieldName}>(?:<!\[CDATA\[\\s*(.*?)\\s*\]\]>|(.*?))<\/${fieldName}>`, 's');
                    const fieldMatch = productXML.match(regex);
                    const rawValue = fieldMatch ? (fieldMatch[1] || fieldMatch[2] || '') : '';
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

            return { products, totalProducts };
        }

        const parsedData = parseXML(xmlContent);
        const parsedProducts = parsedData.products;
        
        await updateProgress('parsing_completed', parsedData.totalProducts, parsedData.totalProducts, 'Tüm ürünler başarıyla ayrıştırıldı');
        
        let imported_count = 0;
        let updated_count = 0;
        let failed_count = 0;
        const error_log = [];
        let processingCount = 0;
        let memoryPeakMB = 0;

        await updateProgress('importing', 0, parsedProducts.length, 'Akıllı ürün güncelleme sistemi başlatıldı');

        // Batch processing - 100 üründe bir commit
        const BATCH_SIZE = 100;
        let batchNumber = 0;
        
        for (let i = 0; i < parsedProducts.length; i += BATCH_SIZE) {
            batchNumber++;
            const batch = parsedProducts.slice(i, i + BATCH_SIZE);
            const batchStartTime = Date.now();
            const batchId = `batch_${importId}_${batchNumber}_${Date.now()}`;

            console.log(`[XML-UPLOAD] ${importId} - Batch ${batchNumber} başlatıldı (${batch.length} ürün)`);

            const batchProcessedBefore = processingCount;
            let batchUpdated = 0;
            let batchInserted = 0;
            let batchFailed = 0;

            try {
                for (const product of batch) {
                    try {
                        processingCount++;
                        
                        const currentMemoryMB = getMemoryUsage();
                        memoryPeakMB = Math.max(memoryPeakMB, currentMemoryMB);
                        
                        if (currentMemoryMB > 150) {
                            console.warn(`[XML-UPLOAD] ${importId} - Yüksek bellek kullanımı: ${currentMemoryMB}MB`);
                        }
                        
                        if (await checkCancellation()) {
                            throw new Error('Upload işlemi iptal edildi');
                        }

                        const processingStartTime = Date.now();

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

                        // Kategori bul veya oluştur - HİYERARŞİK ARAMA
                        let categoryId = null;
                        
                        // 1. Önce subCategory ile ara
                        if (product.subCategory) {
                            const subCatSlug = product.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const { data: subCatMatch } = await supabaseAdmin
                                .from('categories')
                                .select('id')
                                .eq('slug', subCatSlug)
                                .maybeSingle();
                            
                            if (subCatMatch) {
                                categoryId = subCatMatch.id;
                            }
                        }
                        
                        // 2. SubCategory bulunamadıysa category ile ara
                        if (!categoryId && product.category) {
                            const catSlug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const { data: catMatch } = await supabaseAdmin
                                .from('categories')
                                .select('id')
                                .eq('slug', catSlug)
                                .maybeSingle();
                            
                            if (catMatch) {
                                categoryId = catMatch.id;
                            }
                        }
                        
                        // 3. Category bulunamadıysa mainCategory ile ara
                        if (!categoryId && product.mainCategory) {
                            const mainCatSlug = product.mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const { data: mainCatMatch } = await supabaseAdmin
                                .from('categories')
                                .select('id')
                                .eq('slug', mainCatSlug)
                                .maybeSingle();
                            
                            if (mainCatMatch) {
                                categoryId = mainCatMatch.id;
                            }
                        }
                        
                        // 4. Hiçbir kategori bulunamadıysa "KATEGORİSİZ-ÜRÜNLER" kategorisine ata
                        if (!categoryId) {
                            const { data: uncategorizedMatch } = await supabaseAdmin
                                .from('categories')
                                .select('id')
                                .eq('slug', 'kategori-si-z-urunler')
                                .maybeSingle();
                            
                            if (uncategorizedMatch) {
                                categoryId = uncategorizedMatch.id;
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

                        const newProductData = {
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

                        let existingProductResponse;
                        try {
                            existingProductResponse = await fetch(
                                `${supabaseUrl}/rest/v1/products?product_code=eq.${encodeURIComponent(product.product_code)}`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'apikey': serviceRoleKey
                                    }
                                }
                            );
                        } catch (productCodeError) {
                            console.warn(`[XML-UPLOAD] ${importId} - Product_code arama hatası, barcode deneniyor:`, productCodeError.message);
                            
                            existingProductResponse = await fetch(
                                `${supabaseUrl}/rest/v1/products?barcode=eq.${encodeURIComponent(product.barcode)}`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'apikey': serviceRoleKey
                                    }
                                }
                            );
                        }

                        const existingProducts = await existingProductResponse.json();
                        let productId;

                        const processingTime = Date.now() - processingStartTime;
                        const currentMemoryMB = getMemoryUsage();

                        if (existingProducts.length > 0) {
                            const existingProduct = existingProducts[0];
                            const smartUpdateResult = await smartUpdateProduct(
                                supabaseUrl, serviceRoleKey, existingProduct, newProductData,
                                userId, userData.email || 'unknown', importId, batchId
                            );

                            if (smartUpdateResult.updated) {
                                updated_count++;
                                batchUpdated++;
                                
                                console.log(`[XML-UPLOAD] ${importId} - Akıllı güncelleme: ${product.product_code}, Değişen alanlar:`, 
                                    Object.keys(smartUpdateResult.changedFields));
                            } else {
                                console.log(`[XML-UPLOAD] ${importId} - Değişiklik yok: ${product.product_code}`);
                            }
                            
                            productId = smartUpdateResult.productId;
                        } else {
                            const createProductResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=representation'
                                },
                                body: JSON.stringify(newProductData)
                            });

                            if (createProductResponse.ok) {
                                const newProduct = await createProductResponse.json();
                                productId = newProduct[0].id;
                                
                                await logProductUpdate(
                                    supabaseUrl, serviceRoleKey, productId, 'insert',
                                    {}, newProductData, newProductData, 'bulk_import',
                                    userId, userData.email || 'unknown', importId, batchId,
                                    processingTime, currentMemoryMB, parseFloat(product.price) || 0,
                                    parseInt(product.stock) || 0
                                );
                                
                                batchInserted++;
                                imported_count++;
                                
                                console.log(`[XML-UPLOAD] ${importId} - Yeni ürün eklendi: ${product.product_code}`);
                            }
                        }

                        if (productId) {
                            const images = [product.image1, product.image2, product.image3, product.image4].filter(img => img);
                            
                            if (images.length > 0) {
                                // Önce mevcut resimleri sil
                                const { error: deleteError } = await supabaseAdmin
                                    .from('product_images')
                                    .delete()
                                    .eq('product_id', productId);
                                
                                if (deleteError) {
                                    console.error('Resim silme hatası:', deleteError);
                                }
                                
                                // Yeni resimleri ekle
                                for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
                                    const { error: imgError } = await supabaseAdmin
                                        .from('product_images')
                                        .insert({
                                            product_id: productId,
                                            image_url: images[imgIndex],
                                            order_index: imgIndex,
                                            is_primary: imgIndex === 0
                                        });
                                    
                                    if (imgError) {
                                        console.error(`Resim ekleme hatası (${imgIndex}):`, imgError);
                                    }
                                }
                            }
                        }

                        if (existingProducts.length === 0) {
                            imported_count++;
                        }
                        
                    } catch (err) {
                        batchFailed++;
                        failed_count++;
                        const errorMsg = err.message || 'Bilinmeyen hata';
                        error_log.push({
                            product_code: product.product_code || 'unknown',
                            error: errorMsg,
                            timestamp: new Date().toISOString(),
                            batch_id: batchId
                        });
                        
                        console.error(`[XML-UPLOAD] ${importId} - Ürün işleme hatası:`, {
                            product_code: product.product_code,
                            batch_number: batchNumber,
                            error: errorMsg
                        });
                    }
                }

                const batchProcessingTime = Date.now() - batchStartTime;
                await savePerformanceMetrics(
                    supabaseUrl, serviceRoleKey, importId, batchNumber, batch.length,
                    batchProcessingTime, memoryPeakMB, batch.length, batchUpdated,
                    batchInserted, batchFailed
                );

                console.log(`[XML-UPLOAD] ${importId} - Batch ${batchNumber} tamamlandı: ${batchUpdated} güncelleme, ${batchInserted} yeni, ${batchFailed} hata`);

                if (failed_count > 0) {
                    await updateProgress('importing_with_errors', processingCount, parsedProducts.length, 
                        `${imported_count} yeni, ${updated_count} güncellendi, ${failed_count} hata`);
                } else {
                    await updateProgress('importing', processingCount, parsedProducts.length, 
                        `${imported_count} yeni, ${updated_count} güncellendi`);
                }

            } catch (batchError) {
                console.error(`[XML-UPLOAD] ${importId} - Batch ${batchNumber} hatası:`, batchError);
                
                batchFailed += batch.length;
                failed_count += batch.length;
                
                for (const product of batch) {
                    error_log.push({
                        product_code: product.product_code || 'unknown',
                        error: `Batch hatası: ${batchError.message}`,
                        timestamp: new Date().toISOString(),
                        batch_id: batchId
                    });
                }
            }
        }

        const finalSuccessCount = imported_count + updated_count;
        const finalStatus = failed_count === parsedProducts.length ? 'failed' : 
                           (failed_count > 0 ? 'completed_with_errors' : 'completed');
        const finalMessage = `Akıllı güncelleme tamamlandı: ${finalSuccessCount}/${parsedProducts.length} başarılı (${imported_count} yeni, ${updated_count} güncellendi), ${failed_count} hata`;
        
        await fetch(`${supabaseUrl}/rest/v1/xml_imports?id=eq.${importId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                total_products: parsedProducts.length,
                imported_count: finalSuccessCount,
                failed_count,
                status: finalStatus,
                error_log: error_log,
                current_stage: finalStatus,
                progress_percentage: 100,
                status_message: finalMessage,
                completed_at: new Date().toISOString(),
                processing_duration: Date.now() - new Date(importRecord[0].created_at).getTime(),
                memory_peak_usage: memoryPeakMB
            })
        });

        console.log(`[XML-UPLOAD] ${importId} - Akıllı güncelleme tamamlandı:`, {
            total: parsedProducts.length,
            new_products: imported_count,
            updated_products: updated_count,
            failed: failed_count,
            batches_processed: batchNumber,
            status: finalStatus,
            memory_peak_mb: memoryPeakMB
        });

        return new Response(JSON.stringify({
            data: {
                import_id: importId,
                total: parsedProducts.length,
                imported: imported_count,
                updated: updated_count,
                failed: failed_count,
                status: finalStatus,
                errors: error_log,
                file_size_mb: fileSizeInMB.toFixed(2),
                processing_stats: {
                    stage: finalStatus,
                    progress: 100,
                    memory_peak_usage: memoryPeakMB,
                    batches_processed: batchNumber,
                    smart_update_enabled: true,
                    performance_metrics: {
                        avg_processing_time: (Date.now() - new Date(importRecord[0].created_at).getTime()) / parsedProducts.length,
                        efficiency: `${Math.round(((imported_count + updated_count) / parsedProducts.length) * 100)}%`
                    }
                },
                smart_update_features: {
                    diff_detection: true,
                    batch_processing: true,
                    intelligent_updates: true,
                    performance_monitoring: true,
                    comprehensive_logging: true
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('XML upload error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'XML_UPLOAD_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
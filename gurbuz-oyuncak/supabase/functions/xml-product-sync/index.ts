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

    const startTime = Date.now();
    let syncId: string | null = null;

    try {
        const { xmlContent, xmlUrl, filename, source, userId } = await req.json();

        let finalXmlContent = xmlContent;
        let finalFilename = filename || 'remote.xml';

        // Eğer URL varsa, server-side'da fetch yap
        if (xmlUrl && !xmlContent) {
            try {
                console.log('Fetching XML from URL:', xmlUrl);
                
                const response = await fetch(xmlUrl, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Supabase/1.0; +https://supabase.com)',
                        'Accept': 'application/xml, text/xml, */*'
                    },
                    signal: AbortSignal.timeout(30000) // 30 saniye timeout
                });

                if (!response.ok) {
                    throw new Error(`URL erişim hatası: ${response.status} ${response.statusText}`);
                }

                finalXmlContent = await response.text();
                finalFilename = xmlUrl.split('/').pop() || 'remote.xml';
                console.log('XML fetched successfully, size:', finalXmlContent.length);
            } catch (error: any) {
                console.error('URL fetch error:', error);
                throw new Error(`URL'den veri çekilemedi: ${error.message}`);
            }
        }

        if (!finalXmlContent) {
            throw new Error('XML içeriği bulunamadı');
        }

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Senkronizasyon kaydı oluştur
        const syncRecord = await createSyncRecord(
            SUPABASE_URL, 
            SERVICE_ROLE_KEY, 
            source || 'file', 
            finalFilename, 
            userId,
            finalXmlContent.length
        );
        syncId = syncRecord.id;

        // XML'i parse et (regex tabanlı)
        await updateSyncProgress(SUPABASE_URL, SERVICE_ROLE_KEY, syncId, 'parsing', 10);
        
        // 1. Markaları çek ve senkronize et
        console.log('Parsing brands...');
        const brands = parseXMLBrands(finalXmlContent);
        console.log(`Found ${brands.size} unique brands`);
        
        await updateSyncProgress(SUPABASE_URL, SERVICE_ROLE_KEY, syncId, 'syncing_brands', 20);
        const brandResults = await syncBrandsToDatabase(SUPABASE_URL, SERVICE_ROLE_KEY, brands);
        console.log(`Brands synced: ${brandResults.synced}, new: ${brandResults.created}`);
        
        // 2. Kategorileri çek ve senkronize et
        console.log('Parsing categories...');
        const categories = parseXMLCategories(finalXmlContent);
        console.log(`Found ${categories.size} unique categories`);
        
        await updateSyncProgress(SUPABASE_URL, SERVICE_ROLE_KEY, syncId, 'syncing_categories', 30);
        const categoryResults = await syncCategoriesToDatabase(SUPABASE_URL, SERVICE_ROLE_KEY, categories);
        console.log(`Categories synced: ${categoryResults.synced}, new: ${categoryResults.created}`);
        
        // 3. Ürünleri parse et
        console.log('Parsing products...');
        const products = parseXMLProducts(finalXmlContent);

        if (!products || products.length === 0) {
            throw new Error('XML içinde ürün verisi bulunamadı');
        }

        await updateSyncProgress(SUPABASE_URL, SERVICE_ROLE_KEY, syncId, 'syncing_products', 50);

        // 4. Ürünleri senkronize et
        const syncResults = await smartProductSync(
            SUPABASE_URL,
            SERVICE_ROLE_KEY,
            syncId,
            products
        );

        // Tamamlandı olarak işaretle
        await completeSyncRecord(
            SUPABASE_URL,
            SERVICE_ROLE_KEY,
            syncId,
            syncResults,
            Date.now() - startTime
        );

        return new Response(JSON.stringify({
            success: true,
            data: {
                syncId,
                brands: {
                    synced: brandResults.synced,
                    created: brandResults.created
                },
                categories: {
                    synced: categoryResults.synced,
                    created: categoryResults.created
                },
                products: {
                    total: syncResults.total,
                    new: syncResults.newProducts,
                    updated: syncResults.updated,
                    deactivated: syncResults.deactivated,
                    failed: syncResults.failed,
                    skipped: syncResults.skipped
                },
                processingTime: Date.now() - startTime
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('XML Sync Error:', error);

        // Hata durumunda sync kaydını güncelle
        if (syncId) {
            await failSyncRecord(
                Deno.env.get('SUPABASE_URL')!,
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
                syncId,
                error.message
            );
        }

        return new Response(JSON.stringify({
            error: {
                code: 'XML_SYNC_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// XML'den ürünleri parse etme (REGEX tabanlı - DOMParser kullanmıyoruz)
function parseXMLProducts(xmlContent: string): any[] {
    const products: any[] = [];

    // CDATA temizleme
    let cleanedXml = xmlContent.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');

    // Product etiketlerini bul
    const productRegex = /<product[^>]*>(.*?)<\/product>/gis;
    const productMatches = cleanedXml.matchAll(productRegex);

    for (const match of productMatches) {
        const productXml = match[1];
        
        const product: any = {};

        // Her bir alanı regex ile çıkar
        product.Product_code = extractTagValue(productXml, 'Product_code') || extractTagValue(productXml, 'product_code') || extractTagValue(productXml, 'sku');
        product.Name = extractTagValue(productXml, 'Name') || extractTagValue(productXml, 'name') || extractTagValue(productXml, 'title');
        product.mainCategory = extractTagValue(productXml, 'mainCategory') || extractTagValue(productXml, 'main_category');
        product.category = extractTagValue(productXml, 'category') || extractTagValue(productXml, 'sub_category');
        product.subCategory = extractTagValue(productXml, 'subCategory') || extractTagValue(productXml, 'subcategory');
        product.brand_name = extractTagValue(productXml, 'brand') || extractTagValue(productXml, 'brand_name');
        product.Price = parseFloat(extractTagValue(productXml, 'Price') || extractTagValue(productXml, 'price') || '0');
        product.Stock = parseInt(extractTagValue(productXml, 'Stock') || extractTagValue(productXml, 'stock') || extractTagValue(productXml, 'quantity') || '0');
        product.Description = extractTagValue(productXml, 'Description') || extractTagValue(productXml, 'description') || extractTagValue(productXml, 'desc');
        product.image_url = extractTagValue(productXml, 'image_url') || extractTagValue(productXml, 'image') || extractTagValue(productXml, 'picture');
        product.barcode = extractTagValue(productXml, 'barcode') || extractTagValue(productXml, 'ean');

        // Ürün kodu yoksa atla
        if (!product.Product_code || !product.Name) {
            continue;
        }

        products.push(product);
    }

    return products;
}

// XML tag değerini çıkarma helper fonksiyonu
function extractTagValue(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
}

// Akıllı ürün senkronizasyonu
async function smartProductSync(
    supabaseUrl: string,
    serviceRoleKey: string,
    syncId: string,
    products: any[]
): Promise<{
    total: number;
    newProducts: number;
    updated: number;
    deactivated: number;
    failed: number;
    skipped: number;
}> {
    let newProducts = 0;
    let updated = 0;
    let deactivated = 0;
    let failed = 0;
    let skipped = 0;

    // Mevcut ürünleri al (Product_code ile)
    const existingProductsResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id,product_code,name,base_price,stock,is_active`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    console.log('Products fetch status:', existingProductsResponse.status);
    
    let existingProductsArray = [];
    
    if (existingProductsResponse.ok) {
        const existingProducts = await existingProductsResponse.json();
        existingProductsArray = Array.isArray(existingProducts) ? existingProducts : [];
    } else {
        const errorText = await existingProductsResponse.text();
        console.error('Products fetch error:', errorText);
        // Hata olsa bile devam et, boş liste ile
        existingProductsArray = [];
    }
    
    const existingProductMap = new Map(
        existingProductsArray.map((p: any) => [p.product_code, p])
    );

    const xmlProductCodes = new Set(products.map(p => p.Product_code));

    // Her ürünü işle
    for (const xmlProduct of products) {
        try {
            const existingProduct = existingProductMap.get(xmlProduct.Product_code);

            if (!existingProduct) {
                // YENİ ÜRÜN: Ekle
                const insertResult = await insertProduct(supabaseUrl, serviceRoleKey, xmlProduct);
                if (insertResult.success) {
                    newProducts++;
                    await logSync(supabaseUrl, serviceRoleKey, syncId, xmlProduct.Product_code, xmlProduct.Name, 'insert', null, xmlProduct, null);
                } else {
                    failed++;
                    await logSync(supabaseUrl, serviceRoleKey, syncId, xmlProduct.Product_code, xmlProduct.Name, 'error', null, null, insertResult.error);
                }
            } else {
                // MEVCUT ÜRÜN: Değişiklikleri kontrol et ve güncelle
                const changes: any = {};
                let hasChanges = false;

                if (xmlProduct.Name && xmlProduct.Name !== existingProduct.name) {
                    changes.name = xmlProduct.Name;
                    hasChanges = true;
                }

                if (xmlProduct.Price && parseFloat(xmlProduct.Price) !== parseFloat(existingProduct.base_price)) {
                    changes.base_price = parseFloat(xmlProduct.Price);
                    hasChanges = true;
                }

                if (xmlProduct.Stock !== null && parseInt(xmlProduct.Stock) !== parseInt(existingProduct.stock)) {
                    changes.stock = parseInt(xmlProduct.Stock);
                    hasChanges = true;
                }

                // Stok 0 veya negatifse is_active = false
                if (parseInt(xmlProduct.Stock) <= 0 && existingProduct.is_active) {
                    changes.is_active = false;
                    hasChanges = true;
                }

                // Stok varsa ve pasifse aktif yap
                if (parseInt(xmlProduct.Stock) > 0 && !existingProduct.is_active) {
                    changes.is_active = true;
                    hasChanges = true;
                }

                if (hasChanges) {
                    const updateResult = await updateProduct(supabaseUrl, serviceRoleKey, existingProduct.id, changes);
                    if (updateResult.success) {
                        updated++;
                        await logSync(supabaseUrl, serviceRoleKey, syncId, xmlProduct.Product_code, xmlProduct.Name, 'update', existingProduct, changes, changes);
                    } else {
                        failed++;
                        await logSync(supabaseUrl, serviceRoleKey, syncId, xmlProduct.Product_code, xmlProduct.Name, 'error', null, null, updateResult.error);
                    }
                } else {
                    skipped++;
                    await logSync(supabaseUrl, serviceRoleKey, syncId, xmlProduct.Product_code, xmlProduct.Name, 'skip', null, null, null);
                }
            }
        } catch (error) {
            failed++;
            await logSync(supabaseUrl, serviceRoleKey, syncId, xmlProduct.Product_code, xmlProduct.Name || 'Unknown', 'error', null, null, error.message);
        }
    }

    // XML'de olmayan aktif ürünleri pasifleştir
    for (const [productCode, existingProduct] of existingProductMap) {
        if (!xmlProductCodes.has(productCode) && existingProduct.is_active) {
            const updateResult = await updateProduct(supabaseUrl, serviceRoleKey, existingProduct.id, { is_active: false });
            if (updateResult.success) {
                deactivated++;
                await logSync(supabaseUrl, serviceRoleKey, syncId, productCode, existingProduct.name, 'deactivate', existingProduct, { is_active: false }, { reason: 'Not in XML' });
            }
        }
    }

    return {
        total: products.length,
        newProducts,
        updated,
        deactivated,
        failed,
        skipped
    };
}

// Slug oluşturma fonksiyonu
function createSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Ürün ekleme
async function insertProduct(supabaseUrl: string, serviceRoleKey: string, product: any): Promise<{ success: boolean; error?: string }> {
    try {
        const slug = createSlug(product.Name);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                product_code: product.Product_code,
                name: product.Name,
                slug: slug,
                description: product.Description || '',
                base_price: parseFloat(product.Price) || 0,
                stock: parseInt(product.Stock) || 0,
                brand_name: product.brand_name || null,
                barcode: product.barcode || null,
                is_active: parseInt(product.Stock) > 0,
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: errorText };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Ürün güncelleme
async function updateProduct(supabaseUrl: string, serviceRoleKey: string, productId: string, changes: any): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                ...changes,
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: errorText };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Senkronizasyon kaydı oluşturma
async function createSyncRecord(supabaseUrl: string, serviceRoleKey: string, sourceType: string, sourceName: string, userId: string | null, fileSize: number): Promise<any> {
    const response = await fetch(`${supabaseUrl}/rest/v1/xml_sync_history`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            sync_type: 'manual',
            source_type: sourceType,
            source_name: sourceName,
            status: 'processing',
            current_stage: 'initializing',
            progress_percentage: 0,
            file_size_bytes: fileSize,
            created_by: userId || null
        })
    });

    const data = await response.json();
    return data[0];
}

// Senkronizasyon progress güncelleme
async function updateSyncProgress(supabaseUrl: string, serviceRoleKey: string, syncId: string, stage: string, progress: number): Promise<void> {
    await fetch(`${supabaseUrl}/rest/v1/xml_sync_history?id=eq.${syncId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            current_stage: stage,
            progress_percentage: progress,
            updated_at: new Date().toISOString()
        })
    });
}

// Senkronizasyon tamamlama
async function completeSyncRecord(supabaseUrl: string, serviceRoleKey: string, syncId: string, results: any, processingTime: number): Promise<void> {
    await fetch(`${supabaseUrl}/rest/v1/xml_sync_history?id=eq.${syncId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'completed',
            current_stage: 'completed',
            progress_percentage: 100,
            total_products: results.total,
            new_products: results.newProducts,
            updated_products: results.updated,
            deactivated_products: results.deactivated,
            failed_products: results.failed,
            skipped_products: results.skipped,
            completed_at: new Date().toISOString(),
            processing_time_ms: processingTime,
            updated_at: new Date().toISOString()
        })
    });
}

// Senkronizasyon hatası kaydetme
async function failSyncRecord(supabaseUrl: string, serviceRoleKey: string, syncId: string, errorMessage: string): Promise<void> {
    await fetch(`${supabaseUrl}/rest/v1/xml_sync_history?id=eq.${syncId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    });
}

// Log kaydetme
async function logSync(supabaseUrl: string, serviceRoleKey: string, syncId: string, productCode: string, productName: string, action: string, oldValues: any, newValues: any, changes: any): Promise<void> {
    await fetch(`${supabaseUrl}/rest/v1/xml_sync_logs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            sync_id: syncId,
            product_code: productCode,
            product_name: productName,
            action: action,
            old_values: oldValues,
            new_values: newValues,
            changes: changes,
            error_message: action === 'error' ? (changes || 'Unknown error') : null
        })
    });
}


// ==================== BRAND VE CATEGORY EXTRACTION ====================

// XML'den markaları parse etme
function parseXMLBrands(xmlContent: string): Set<string> {
    const brands = new Set<string>();
    
    // CDATA temizleme
    let cleanedXml = xmlContent.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
    
    // Brand etiketlerini bul
    const brandRegex = /<brand[^>]*>(.*?)<\/brand>/gis;
    const brandMatches = cleanedXml.matchAll(brandRegex);
    
    for (const match of brandMatches) {
        const brandName = match[1]?.trim();
        if (brandName && brandName.length > 0) {
            brands.add(brandName);
        }
    }
    
    // Alternatif: brand_name etiketi
    const brandNameRegex = /<brand_name[^>]*>(.*?)<\/brand_name>/gis;
    const brandNameMatches = cleanedXml.matchAll(brandNameRegex);
    
    for (const match of brandNameMatches) {
        const brandName = match[1]?.trim();
        if (brandName && brandName.length > 0) {
            brands.add(brandName);
        }
    }
    
    return brands;
}

// XML'den kategorileri parse etme (hierarchical structure with parent relationships)
function parseXMLCategories(xmlContent: string): Map<string, { main: string | null, category: string | null, sub: string | null }> {
    const categoryHierarchy = new Map<string, { main: string | null, category: string | null, sub: string | null }>();
    
    // CDATA temizleme
    let cleanedXml = xmlContent.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
    
    // Product etiketlerini bul ve her birinden kategori hiyerarşisini çıkar
    const productRegex = /<product[^>]*>(.*?)<\/product>/gis;
    const productMatches = cleanedXml.matchAll(productRegex);
    
    for (const match of productMatches) {
        const productXml = match[1];
        
        // mainCategory, category, subCategory değerlerini çıkar
        const mainCategory = extractTagValue(productXml, 'mainCategory') || extractTagValue(productXml, 'main_category');
        const category = extractTagValue(productXml, 'category');
        const subCategory = extractTagValue(productXml, 'subCategory') || extractTagValue(productXml, 'sub_category') || extractTagValue(productXml, 'subcategory');
        
        // Hiyerarşi oluştur (main > category > sub)
        if (mainCategory) {
            const key = `${mainCategory}|${category || ''}|${subCategory || ''}`;
            if (!categoryHierarchy.has(key)) {
                categoryHierarchy.set(key, {
                    main: mainCategory.trim(),
                    category: category?.trim() || null,
                    sub: subCategory?.trim() || null
                });
            }
        }
    }
    
    return categoryHierarchy;
}

// Markaları veritabanına senkronize etme
async function syncBrandsToDatabase(
    supabaseUrl: string, 
    serviceRoleKey: string, 
    brands: Set<string>
): Promise<{ synced: number; created: number }> {
    let synced = 0;
    let created = 0;
    
    // Mevcut markaları al
    const existingBrandsResponse = await fetch(`${supabaseUrl}/rest/v1/brands?select=id,name,slug`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });
    
    let existingBrandsArray = [];
    if (existingBrandsResponse.ok) {
        existingBrandsArray = await existingBrandsResponse.json();
    }
    
    const existingBrandNames = new Set(existingBrandsArray.map((b: any) => b.name.toLowerCase()));
    
    // Her marka için kontrol et
    for (const brandName of brands) {
        synced++;
        
        if (!existingBrandNames.has(brandName.toLowerCase())) {
            // Yeni marka ekle
            const slug = createSlug(brandName);
            
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/brands`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    name: brandName,
                    slug: slug,
                    is_active: true,
                    created_at: new Date().toISOString()
                })
            });
            
            if (insertResponse.ok) {
                created++;
                console.log(`Brand created: ${brandName}`);
            } else {
                const errorText = await insertResponse.text();
                console.error(`Failed to create brand ${brandName}:`, errorText);
            }
        }
    }
    
    return { synced, created };
}

// Kategorileri veritabanına senkronize etme (hierarchical with parent relationships)
async function syncCategoriesToDatabase(
    supabaseUrl: string, 
    serviceRoleKey: string, 
    categoryHierarchy: Map<string, { main: string | null, category: string | null, sub: string | null }>
): Promise<{ synced: number; created: number }> {
    let synced = 0;
    let created = 0;
    
    // Mevcut kategorileri al
    const existingCategoriesResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name,slug,parent_id,level`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });
    
    let existingCategoriesArray = [];
    if (existingCategoriesResponse.ok) {
        existingCategoriesArray = await existingCategoriesResponse.json();
    }
    
    // Kategori adından ID'ye map oluştur
    const categoryNameToId = new Map<string, number>();
    existingCategoriesArray.forEach((cat: any) => {
        categoryNameToId.set(cat.name.toLowerCase(), cat.id);
    });
    
    // Tüm benzersiz kategorileri topla
    const allMainCategories = new Set<string>();
    const allCategories = new Set<string>();
    const allSubCategories = new Set<string>();
    
    for (const hierarchy of categoryHierarchy.values()) {
        if (hierarchy.main) allMainCategories.add(hierarchy.main);
        if (hierarchy.category) allCategories.add(hierarchy.category);
        if (hierarchy.sub) allSubCategories.add(hierarchy.sub);
    }
    
    // 1. Ana kategorileri ekle (level 0, parent_id = null)
    for (const mainCat of allMainCategories) {
        synced++;
        if (!categoryNameToId.has(mainCat.toLowerCase())) {
            const slug = createSlug(mainCat);
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: mainCat,
                    slug: slug,
                    parent_id: null,
                    level: 0,
                    order_index: 0,
                    is_active: true,
                    created_at: new Date().toISOString()
                })
            });
            
            if (insertResponse.ok) {
                const insertedData = await insertResponse.json();
                const newId = insertedData[0]?.id;
                if (newId) {
                    categoryNameToId.set(mainCat.toLowerCase(), newId);
                    created++;
                    console.log(`Main category created: ${mainCat} (ID: ${newId})`);
                }
            } else {
                const errorText = await insertResponse.text();
                console.error(`Failed to create main category ${mainCat}:`, errorText);
            }
        }
    }
    
    // 2. Alt kategorileri ekle (level 1, parent_id = mainCategory.id)
    for (const hierarchy of categoryHierarchy.values()) {
        if (hierarchy.category && hierarchy.main) {
            synced++;
            const parentId = categoryNameToId.get(hierarchy.main.toLowerCase());
            
            if (!categoryNameToId.has(hierarchy.category.toLowerCase())) {
                const slug = createSlug(hierarchy.category);
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/categories`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: hierarchy.category,
                        slug: slug,
                        parent_id: parentId || null,
                        level: 1,
                        order_index: 0,
                        is_active: true,
                        created_at: new Date().toISOString()
                    })
                });
                
                if (insertResponse.ok) {
                    const insertedData = await insertResponse.json();
                    const newId = insertedData[0]?.id;
                    if (newId) {
                        categoryNameToId.set(hierarchy.category.toLowerCase(), newId);
                        created++;
                        console.log(`Sub category created: ${hierarchy.category} (Parent: ${hierarchy.main}, ID: ${newId})`);
                    }
                } else {
                    const errorText = await insertResponse.text();
                    console.error(`Failed to create sub category ${hierarchy.category}:`, errorText);
                }
            }
        }
    }
    
    // 3. Alt-alt kategorileri ekle (level 2, parent_id = category.id)
    for (const hierarchy of categoryHierarchy.values()) {
        if (hierarchy.sub && hierarchy.category) {
            synced++;
            const parentId = categoryNameToId.get(hierarchy.category.toLowerCase());
            
            if (!categoryNameToId.has(hierarchy.sub.toLowerCase())) {
                const slug = createSlug(hierarchy.sub);
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/categories`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: hierarchy.sub,
                        slug: slug,
                        parent_id: parentId || null,
                        level: 2,
                        order_index: 0,
                        is_active: true,
                        created_at: new Date().toISOString()
                    })
                });
                
                if (insertResponse.ok) {
                    const insertedData = await insertResponse.json();
                    const newId = insertedData[0]?.id;
                    if (newId) {
                        categoryNameToId.set(hierarchy.sub.toLowerCase(), newId);
                        created++;
                        console.log(`Sub-sub category created: ${hierarchy.sub} (Parent: ${hierarchy.category}, ID: ${newId})`);
                    }
                } else {
                    const errorText = await insertResponse.text();
                    console.error(`Failed to create sub-sub category ${hierarchy.sub}:`, errorText);
                }
            }
        }
    }
    
    return { synced, created };
}

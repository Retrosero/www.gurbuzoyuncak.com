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
        // Request body'den veriyi al
        const requestData = await req.json();
        const { xmlContent, filename, source, originalUrl } = requestData;

        // Validation
        if (!xmlContent) {
            throw new Error('XML içeriği bulunamadı');
        }

        if (!filename) {
            throw new Error('Dosya adı bulunamadı');
        }

        // XML parsing
        let products: any[] = [];
        try {
            // XML'i DOMParser ile parse et
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            
            // XML parse hatası kontrolü
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Geçersiz XML formatı');
            }

            // Ürünleri bul (farklı XML yapılarını destekle)
            products = findProducts(xmlDoc);

        } catch (xmlError) {
            throw new Error(`XML parsing hatası: ${xmlError.message}`);
        }

        if (products.length === 0) {
            throw new Error('XML içinde ürün verisi bulunamadı');
        }

        // Rate limiting simülasyonu (gerçek uygulamada Redis kullanılabilir)
        const rateLimitKey = `xml_upload_${Date.now()}`;
        
        // Ürünleri Supabase'e kaydet
        let imported = 0;
        let failed = 0;
        const results = [];

        for (const product of products) {
            try {
                // Ürün validasyonu
                const validatedProduct = validateProduct(product);
                if (!validatedProduct.name || !validatedProduct.price) {
                    failed++;
                    results.push({
                        status: 'failed',
                        reason: 'Eksik gerekli alanlar (name, price)',
                        product: product
                    });
                    continue;
                }

                // Supabase'e kaydet (products tablosuna)
                // Bu kısım gerçek Supabase project bilgileri ile güncellenmeli
                const insertResult = await saveProduct(validatedProduct);
                
                if (insertResult.success) {
                    imported++;
                    results.push({
                        status: 'success',
                        product: validatedProduct,
                        id: insertResult.id
                    });
                } else {
                    failed++;
                    results.push({
                        status: 'failed',
                        reason: insertResult.error,
                        product: product
                    });
                }

            } catch (productError) {
                failed++;
                results.push({
                    status: 'failed',
                    reason: productError.message,
                    product: product
                });
            }
        }

        // Sonucu döndür
        const response = {
            success: true,
            data: {
                total: products.length,
                imported: imported,
                failed: failed,
                source: source || 'file',
                filename: filename,
                url: originalUrl,
                processingTime: Date.now(),
                results: results.slice(0, 10) // İlk 10 sonucu göster
            }
        };

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('XML Upload Error:', error);
        
        const errorResponse = {
            error: {
                code: 'XML_UPLOAD_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// XML'den ürünleri bulma fonksiyonu
function findProducts(xmlDoc: Document): any[] {
    const products: any[] = [];

    // Farklı XML yapılarını destekle
    const selectors = [
        'product',
        'products > product',
        'item',
        'items > item',
        'catalog > product',
        'data > product'
    ];

    for (const selector of selectors) {
        const elements = xmlDoc.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(element => {
                const product = parseProductElement(element);
                if (product && Object.keys(product).length > 0) {
                    products.push(product);
                }
            });
            break; // İlk başarılı selector'ı kullan
        }
    }

    return products;
}

// XML elementinden ürün verisini parse etme
function parseProductElement(element: Element): any {
    const product: any = {};

    // Temel alanları bul
    const nameElement = element.querySelector('name, title, product_name, productName');
    const priceElement = element.querySelector('price, cost, amount, value');
    const descElement = element.querySelector('description, desc, detail, details');
    const categoryElement = element.querySelector('category, cat, brand');
    const imageElement = element.querySelector('image, photo, picture, img, image_url, imageUrl');
    const stockElement = element.querySelector('stock, quantity, qty, amount');

    // İsim
    if (nameElement) {
        product.name = nameElement.textContent?.trim() || '';
    } else {
        // Eğer name element'i bulunamazsa, ilk text content'i kullan
        const firstText = element.textContent?.trim();
        if (firstText && firstText.length > 0) {
            product.name = firstText;
        }
    }

    // Fiyat
    if (priceElement) {
        const priceText = priceElement.textContent?.trim() || '';
        product.price = parseFloat(priceText.replace(/[^0-9.,]/g, '')) || 0;
    }

    // Açıklama
    if (descElement) {
        product.description = descElement.textContent?.trim() || '';
    }

    // Kategori/Marka
    if (categoryElement) {
        product.category = categoryElement.textContent?.trim() || '';
    }

    // Resim URL
    if (imageElement) {
        product.image_url = imageElement.textContent?.trim() || '';
    }

    // Stok
    if (stockElement) {
        const stockText = stockElement.textContent?.trim() || '';
        product.stock = parseInt(stockText.replace(/[^0-9]/g, '')) || 0;
    }

    // ID al (eğer varsa)
    const idElement = element.querySelector('id, product_id, productId, code, sku');
    if (idElement) {
        product.external_id = idElement.textContent?.trim() || '';
    }

    return product;
}

// Ürün validasyonu
function validateProduct(product: any): any {
    const validated: any = {
        name: product.name?.trim() || '',
        price: parseFloat(product.price) || 0,
        description: product.description?.trim() || '',
        category: product.category?.trim() || '',
        image_url: product.image_url?.trim() || '',
        stock: parseInt(product.stock) || 0,
        external_id: product.external_id?.trim() || '',
        updated_at: new Date().toISOString()
    };

    // Fiyat validasyonu
    if (validated.price <= 0) {
        validated.price = 0;
    }

    // Stok validasyonu
    if (validated.stock < 0) {
        validated.stock = 0;
    }

    // İsim uzunluk kontrolü
    if (validated.name.length > 255) {
        validated.name = validated.name.substring(0, 255);
    }

    return validated;
}

// Supabase'e ürün kaydetme (gerçek uygulamada Supabase client kullanılacak)
async function saveProduct(product: any): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        // Gerçek Supabase entegrasyonu burada yapılacak
        // Bu örnekte simülasyon yapıyoruz
        
        // Supabase client instance oluştur
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            // Development modunda simülasyon
            console.log('Supabase credentials not found, running in simulation mode');
            return {
                success: true,
                id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }

        // Gerçek Supabase'e kaydet
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            const result = await response.json();
            return {
                success: true,
                id: result[0]?.id || `unknown_${Date.now()}`
            };
        } else {
            const error = await response.text();
            return {
                success: false,
                error: `Database error: ${response.status} ${error}`
            };
        }

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
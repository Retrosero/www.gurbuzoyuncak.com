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
        // Get Supabase credentials
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Parse request data
        const requestData = await req.json();
        const { xml_content, xml_url, test_mode = false } = requestData;

        let xmlContent = xml_content;

        // Fetch XML from URL if provided
        if (xml_url && !xml_content) {
            const xmlResponse = await fetch(xml_url);
            if (!xmlResponse.ok) {
                throw new Error(`XML fetch failed: ${xmlResponse.statusText}`);
            }
            xmlContent = await xmlResponse.text();
        }

        if (!xmlContent) {
            throw new Error('XML content veya URL gerekli');
        }

        console.log(`[XML-UPLOAD-V2] XML content length: ${xmlContent.length}`);

        // XML parsing with regex (DOMParser unreliable in Deno)
        const productRegex = /<Product>(.*?)<\/Product>/gs;
        const products = [];
        let match;

        while ((match = productRegex.exec(xmlContent)) !== null) {
            const productXml = match[1];
            
            // Helper function to extract field value
            function getField(fieldName) {
                const regex = new RegExp(`<${fieldName}[^>]*>([\\s\\S]*?)<\\/${fieldName}>`, 'i');
                const fieldMatch = productXml.match(regex);
                if (fieldMatch) {
                    let value = fieldMatch[1].trim();
                    // Clean CDATA
                    value = value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
                    return value || null;
                }
                return null;
            }

            // Parse product data
            const product = {
                product_code: getField('Product_Code'),
                barcode: getField('Barcode'),
                mpn: getField('MPN'),
                shelf_code: getField('Shelf_Code'),
                name: getField('Name'),
                description: getField('Description'),
                price: parseFloat(getField('Price')) || 0,
                tax_rate: parseFloat(getField('Tax')) || 0,
                stock: parseInt(getField('Stock')) || 0,
                brand: getField('Brand'),
                category: getField('Category'),
                sub_category: getField('Sub_Category'),
                main_category: getField('Main_Category'),
                origin: getField('urun_mensei'),
                width: parseFloat(getField('width')) || null,
                height: parseFloat(getField('height')) || null,
                depth: parseFloat(getField('depth')) || null,
                desi: parseFloat(getField('desi')) || null,
                weight: parseFloat(getField('weight')) || null,
                // Resim alanları - multiple formats desteklenir
                image1: getField('Image1') || getField('Image'),
                image2: getField('Image2'),
                image3: getField('Image3'),
                image4: getField('Image4'),
                image5: getField('Image5'),
                images: getField('Images') // Çoklu resim formatı
            };

            // Validate required fields
            if (product.product_code && product.name && product.price > 0) {
                products.push(product);
            }
        }

        console.log(`[XML-UPLOAD-V2] Parsed ${products.length} products`);

        if (products.length === 0) {
            throw new Error('XML\'de geçerli ürün bulunamadı');
        }

        let processedCount = 0;
        let newProductCount = 0;
        let updatedProductCount = 0;
        let imageCount = 0;

        // Process products in batches
        const batchSize = 10;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            
            for (const product of batch) {
                try {
                    // Generate slug
                    const slug = product.name
                        .toLowerCase()
                        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
                        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .substring(0, 50);

                    // Check if product exists
                    const existingResponse = await fetch(`${supabaseUrl}/rest/v1/products?product_code=eq.${product.product_code}&select=id,slug`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });

                    const existingProducts = await existingResponse.json();
                    const isExistingProduct = existingProducts.length > 0;
                    let productId = isExistingProduct ? existingProducts[0].id : null;

                    // Find or create brand
                    let brandId = null;
                    if (product.brand) {
                        const brandResponse = await fetch(`${supabaseUrl}/rest/v1/brands?name=eq.${encodeURIComponent(product.brand)}&select=id`, {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        const brands = await brandResponse.json();
                        if (brands.length > 0) {
                            brandId = brands[0].id;
                        } else {
                            // Create new brand
                            const newBrandResponse = await fetch(`${supabaseUrl}/rest/v1/brands`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=representation'
                                },
                                body: JSON.stringify({
                                    name: product.brand,
                                    slug: product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                                })
                            });
                            if (newBrandResponse.ok) {
                                const newBrand = await newBrandResponse.json();
                                brandId = newBrand[0]?.id;
                            }
                        }
                    }

                    // Find category with hierarchical search
                    let categoryId = null;
                    const categorySearchTerms = [
                        product.sub_category,
                        product.category, 
                        product.main_category
                    ].filter(Boolean);

                    for (const searchTerm of categorySearchTerms) {
                        if (categoryId) break;
                        
                        const categoryResponse = await fetch(`${supabaseUrl}/rest/v1/categories?name=eq.${encodeURIComponent(searchTerm)}&select=id`, {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        const categories = await categoryResponse.json();
                        if (categories.length > 0) {
                            categoryId = categories[0].id;
                        }
                    }

                    // Fallback to default category
                    if (!categoryId) {
                        const defaultCategoryResponse = await fetch(`${supabaseUrl}/rest/v1/categories?name=eq.kategorisiz-urunler&select=id`, {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        const defaultCategories = await defaultCategoryResponse.json();
                        if (defaultCategories.length > 0) {
                            categoryId = defaultCategories[0].id;
                        }
                    }

                    // Prepare product data
                    const productData = {
                        product_code: product.product_code,
                        barcode: product.barcode,
                        mpn: product.mpn,
                        shelf_code: product.shelf_code,
                        name: product.name,
                        slug: slug,
                        description: product.description,
                        brand_id: brandId,
                        brand_name: product.brand,
                        category_id: categoryId,
                        base_price: product.price,
                        tax_rate: product.tax_rate,
                        stock: product.stock,
                        origin: product.origin,
                        width: product.width,
                        height: product.height,
                        depth: product.depth,
                        desi: product.desi,
                        weight: product.weight,
                        is_active: product.stock > 0,
                        updated_at: new Date().toISOString()
                    };

                    // Insert or update product
                    if (isExistingProduct) {
                        // Update existing product
                        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(productData)
                        });

                        if (updateResponse.ok) {
                            updatedProductCount++;
                        }
                    } else {
                        // Insert new product
                        productData.created_at = new Date().toISOString();
                        
                        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(productData)
                        });

                        if (insertResponse.ok) {
                            const newProduct = await insertResponse.json();
                            productId = newProduct[0]?.id;
                            newProductCount++;
                        }
                    }

                    // Process images
                    if (productId) {
                        const imageUrls = [];
                        
                        // Single image fields
                        [product.image1, product.image2, product.image3, product.image4, product.image5]
                            .filter(Boolean)
                            .forEach(url => imageUrls.push(url.trim()));

                        // Multiple images in one field (comma or semicolon separated)
                        if (product.images) {
                            const multipleImages = product.images.split(/[,;]/)
                                .map(url => url.trim())
                                .filter(Boolean);
                            imageUrls.push(...multipleImages);
                        }

                        // Remove duplicates and validate URLs
                        const validImageUrls = [...new Set(imageUrls)]
                            .filter(url => url.startsWith('http'))
                            .slice(0, 10); // Max 10 images per product

                        if (validImageUrls.length > 0) {
                            // Delete existing images
                            await fetch(`${supabaseUrl}/rest/v1/product_images?product_id=eq.${productId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey
                                }
                            });

                            // Insert new images
                            for (let i = 0; i < validImageUrls.length; i++) {
                                const imageData = {
                                    product_id: productId,
                                    image_url: validImageUrls[i],
                                    order_index: i,
                                    is_primary: i === 0
                                };

                                const imageResponse = await fetch(`${supabaseUrl}/rest/v1/product_images`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'apikey': serviceRoleKey,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(imageData)
                                });

                                if (imageResponse.ok) {
                                    imageCount++;
                                }
                            }
                        }
                    }

                    processedCount++;

                } catch (productError) {
                    console.error(`Product processing error for ${product.product_code}:`, productError);
                }
            }
        }

        const summary = {
            processed_products: processedCount,
            new_products: newProductCount,
            updated_products: updatedProductCount,
            images_added: imageCount,
            total_parsed: products.length
        };

        console.log('[XML-UPLOAD-V2] Summary:', summary);

        return new Response(JSON.stringify({
            success: true,
            data: summary,
            message: `${processedCount} ürün işlendi, ${imageCount} resim eklendi`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[XML-UPLOAD-V2] Error:', error);

        const errorResponse = {
            success: false,
            error: {
                code: 'XML_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
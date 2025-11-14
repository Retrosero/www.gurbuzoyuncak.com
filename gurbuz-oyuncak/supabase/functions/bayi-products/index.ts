Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { user_id, filters } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_USER_ID', message: 'User ID gerekli' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Bayi bilgilerini al
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!profileResponse.ok) {
      throw new Error('Bayi bilgileri alınamadı')
    }

    const profiles = await profileResponse.json()
    const profile = profiles[0]

    if (!profile || !profile.is_bayi) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_DEALER', message: 'Kullanıcı bayi değil' } }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const discount = profile.bayi_discount_percentage || 0

    // Ürünleri al
    let query = `${supabaseUrl}/rest/v1/products?select=id,name,description,base_price,category_id,brand_id,stock,slug,is_active`
    query += '&is_active=eq.true'

    if (filters?.searchQuery) {
      query += `&name=ilike.*${filters.searchQuery}*`
    }

    if (filters?.category) {
      query += `&category_id=eq.${filters.category}`
    }

    if (filters?.brand) {
      query += `&brand_id=eq.${filters.brand}`
    }

    if (filters?.inStock) {
      query += '&stock=gt.0'
    }

    query += '&order=created_at.desc&limit=100'

    const productsResponse = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!productsResponse.ok) {
      throw new Error('Ürünler alınamadı')
    }

    const products = await productsResponse.json()

    // Kategori ve marka bilgilerini al
    const categoryIds = [...new Set(products.map((p: any) => p.category_id).filter(Boolean))]
    const brandIds = [...new Set(products.map((p: any) => p.brand_id).filter(Boolean))]

    let categories: any = {}
    let brands: any = {}

    if (categoryIds.length > 0) {
      const catResponse = await fetch(
        `${supabaseUrl}/rest/v1/categories?id=in.(${categoryIds.join(',')})&select=id,name`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const catData = await catResponse.json()
      categories = Object.fromEntries(catData.map((c: any) => [c.id, c.name]))
    }

    if (brandIds.length > 0) {
      const brandResponse = await fetch(
        `${supabaseUrl}/rest/v1/brands?id=in.(${brandIds.join(',')})&select=id,name`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const brandData = await brandResponse.json()
      brands = Object.fromEntries(brandData.map((b: any) => [b.id, b.name]))
    }

    // Ürün resimlerini al
    const productIds = products.map((p: any) => p.id)
    let images: any = {}

    if (productIds.length > 0) {
      const imgResponse = await fetch(
        `${supabaseUrl}/rest/v1/product_images?product_id=in.(${productIds.join(',')})&select=product_id,image_url,order_index&order=order_index.asc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const imgData = await imgResponse.json()
      images = imgData.reduce((acc: any, img: any) => {
        if (!acc[img.product_id]) acc[img.product_id] = []
        acc[img.product_id].push(img.image_url)
        return acc
      }, {})
    }

    // Ürünleri işle
    const processedProducts = products.map((product: any) => {
      const originalPrice = product.base_price
      const discountedPrice = originalPrice * (1 - discount / 100)
      const savings = originalPrice - discountedPrice

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        base_price: product.base_price,
        calculated_bayi_price: discountedPrice,
        original_price: originalPrice,
        discount_percentage: discount,
        savings_amount: savings,
        category_name: categories[product.category_id] || '',
        brand_name: brands[product.brand_id] || '',
        stock: product.stock,
        image_urls: images[product.id] || [],
        slug: product.slug
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          products: processedProducts
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Bilinmeyen hata'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

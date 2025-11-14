import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'get';

    switch (action) {
      case 'get':
        return await handleGetSEOData(req, supabaseUrl, supabaseKey);
      case 'update':
        return await handleUpdateSEOData(req, supabaseUrl, supabaseKey);
      case 'generate-structured-data':
        return await handleGenerateStructuredData(req, supabaseUrl, supabaseKey);
      case 'validate-meta':
        return await handleValidateMetaTags(req);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('SEO optimizer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleGetSEOData(req: Request, supabaseUrl: string, supabaseKey: string) {
  const { page_type, entity_id } = await req.json();

  if (!page_type) {
    return new Response(JSON.stringify({ error: 'page_type is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let query = `${supabaseUrl}/rest/v1/seo_settings?page_type=eq.${page_type}&is_active=eq.true&select=*`;
  
  if (entity_id) {
    query += `&entity_id=eq.${entity_id}`;
  }

  const response = await fetch(query, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    }
  });

  const seoData = await response.json();
  
  // If no SEO data found, generate defaults
  if (seoData.length === 0) {
    const defaultSEO = await generateDefaultSEOData(page_type, entity_id, supabaseUrl, supabaseKey);
    return new Response(JSON.stringify({ seo_data: defaultSEO, generated: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ seo_data: seoData[0], generated: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateSEOData(req: Request, supabaseUrl: string, supabaseKey: string) {
  const seoData = await req.json();
  
  // Validate required fields
  if (!seoData.page_type) {
    return new Response(JSON.stringify({ error: 'page_type is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check if SEO setting exists
  const existingQuery = `${supabaseUrl}/rest/v1/seo_settings?page_type=eq.${seoData.page_type}&entity_id=eq.${seoData.entity_id || 'NULL'}`;
  
  const existingResponse = await fetch(existingQuery, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    }
  });

  const existingData = await existingResponse.json();

  let response;
  if (existingData.length > 0) {
    // Update existing
    response = await fetch(`${supabaseUrl}/rest/v1/seo_settings?id=eq.${existingData[0].id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(seoData)
    });
  } else {
    // Create new
    response = await fetch(`${supabaseUrl}/rest/v1/seo_settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(seoData)
    });
  }

  if (!response.ok) {
    throw new Error('Failed to update SEO data');
  }

  const updatedData = await response.json();

  return new Response(JSON.stringify({ success: true, data: updatedData[0] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGenerateStructuredData(req: Request, supabaseUrl: string, supabaseKey: string) {
  const { page_type, entity_id, data } = await req.json();

  if (!page_type || !entity_id || !data) {
    return new Response(JSON.stringify({ error: 'page_type, entity_id, and data are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let structuredData: any = {};

  switch (page_type) {
    case 'product':
      structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.name,
        "description": data.description,
        "image": data.images || [],
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "TRY",
          "availability": data.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": `https://gurbuzoyuncak.com/product/${entity_id}`
        },
        "brand": data.brand ? {
          "@type": "Brand",
          "name": data.brand.name
        } : undefined,
        "category": data.category ? data.category.name : undefined,
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "reviewCount": data.review_count || 1
        } : undefined
      };
      break;

    case 'category':
      structuredData = {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        "name": data.name,
        "description": data.description,
        "url": `https://gurbuzoyuncak.com/category/${data.slug}`,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": data.product_count || 0
        }
      };
      break;

    case 'home':
      structuredData = {
        "@context": "https://schema.org/",
        "@type": "WebSite",
        "name": "Gürbüz Oyuncak",
        "url": "https://gurbuzoyuncak.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://gurbuzoyuncak.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };
      break;
  }

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(page_type, data, entity_id);

  return new Response(JSON.stringify({ 
    structured_data: structuredData,
    breadcrumbs 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleValidateMetaTags(req: Request) {
  const { title, description, keywords } = await req.json();

  const validation = {
    title: {
      isValid: title && title.length >= 10 && title.length <= 60,
      issues: [],
      suggestions: []
    },
    description: {
      isValid: description && description.length >= 50 && description.length <= 160,
      issues: [],
      suggestions: []
    },
    keywords: {
      isValid: keywords && keywords.split(',').length >= 3 && keywords.split(',').length <= 10,
      issues: [],
      suggestions: []
    }
  };

  // Validate title
  if (!validation.title.isValid) {
    if (!title) {
      validation.title.issues.push('Title eksik');
      validation.title.suggestions.push('Sayfa için açıklayıcı bir başlık ekleyin (10-60 karakter)');
    } else if (title.length < 10) {
      validation.title.issues.push('Title çok kısa');
      validation.title.suggestions.push('Title\'i daha açıklayıcı hale getirin');
    } else if (title.length > 60) {
      validation.title.issues.push('Title çok uzun');
      validation.validation.title.suggestions.push('Title\'i kısaltın (60 karakterden az olmalı)');
    }
  }

  // Validate description
  if (!validation.description.isValid) {
    if (!description) {
      validation.description.issues.push('Description eksik');
      validation.description.suggestions.push('Sayfa için meta description ekleyin (50-160 karakter)');
    } else if (description.length < 50) {
      validation.description.issues.push('Description çok kısa');
      validation.description.suggestions.push('Description\'i daha detaylı yazın');
    } else if (description.length > 160) {
      validation.description.issues.push('Description çok uzun');
      validation.description.suggestions.push('Description\'i kısaltın (160 karakterden az olmalı)');
    }
  }

  // Validate keywords
  if (!validation.keywords.isValid) {
    if (!keywords) {
      validation.keywords.issues.push('Keywords eksik');
      validation.keywords.suggestions.push('İlgili anahtar kelimeler ekleyin (3-10 adet)');
    } else {
      const keywordCount = keywords.split(',').length;
      if (keywordCount < 3) {
        validation.keywords.issues.push('Yetersiz anahtar kelime');
        validation.keywords.suggestions.push('Daha fazla anahtar kelime ekleyin');
      } else if (keywordCount > 10) {
        validation.keywords.issues.push('Çok fazla anahtar kelime');
        validation.keywords.suggestions.push('Anahtar kelime sayısını azaltın');
      }
    }
  }

  return new Response(JSON.stringify(validation), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateDefaultSEOData(pageType: string, entityId: number, supabaseUrl: string, supabaseKey: string) {
  // Generate default SEO data based on page type
  let defaultData = {
    page_type: pageType,
    entity_id: entityId,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    structured_data: {},
    breadcrumbs: [],
    is_active: true
  };

  // This would typically fetch actual data and generate appropriate defaults
  // For now, returning a basic structure
  return defaultData;
}

function generateBreadcrumbs(pageType: string, data: any, entityId: number) {
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Ana Sayfa",
      "item": "https://gurbuzoyuncak.com"
    }
  ];

  switch (pageType) {
    case 'category':
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": data.name,
        "item": `https://gurbuzoyuncak.com/category/${data.slug}`
      });
      break;

    case 'product':
      if (data.category) {
        breadcrumbs.push({
          "@type": "ListItem",
          "position": 2,
          "name": data.category.name,
          "item": `https://gurbuzoyuncak.com/category/${data.category.slug}`
        });
      }
      breadcrumbs.push({
        "@type": "ListItem",
        "position": breadcrumbs.length + 1,
        "name": data.name,
        "item": `https://gurbuzoyuncak.com/product/${entityId}`
      });
      break;
  }

  return breadcrumbs;
}
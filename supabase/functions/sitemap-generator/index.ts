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

    // Fetch products with SEO data
    const productsResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,updated_at,seo_settings(meta_title,meta_description)&is_active=eq.true&order=updated_at.desc`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    // Fetch categories with SEO data
    const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name,slug,updated_at,seo_settings(meta_title,meta_description)&is_active=eq.true&order=updated_at.desc`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    // Fetch brands with SEO data
    const brandsResponse = await fetch(`${supabaseUrl}/rest/v1/brands?select=id,name,slug,updated_at,seo_settings(meta_title,meta_description)&is_active=eq.true&order=updated_at.desc`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    const products = await productsResponse.json();
    const categories = await categoriesResponse.json();
    const brands = await brandsResponse.json();

    // Generate sitemap XML
    const baseUrl = 'https://gurbuzoyuncak.com'; // Replace with actual domain

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home page -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Category pages -->
`;

    // Add category URLs
    categories.forEach((category: any) => {
      const lastMod = category.updated_at ? category.updated_at.split('T')[0] : new Date().toISOString().split('T')[0];
      sitemap += `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add brand URLs
    brands.forEach((brand: any) => {
      const lastMod = brand.updated_at ? brand.updated_at.split('T')[0] : new Date().toISOString().split('T')[0];
      sitemap += `  <url>
    <loc>${baseUrl}/brand/${brand.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Add product URLs
    products.forEach((product: any) => {
      const lastMod = product.updated_at ? product.updated_at.split('T')[0] : new Date().toISOString().split('T')[0];
      sitemap += `  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const performanceData = await req.json();
    
    // Validate required fields
    if (!performanceData.page_url || !performanceData.load_time) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: page_url, load_time' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate performance score based on Core Web Vitals
    let performanceScore = 100;
    
    // Penalize for slow load time (threshold: 3 seconds)
    if (performanceData.load_time > 3000) {
      performanceScore -= Math.min(50, Math.floor((performanceData.load_time - 3000) / 100));
    }
    
    // Penalize for slow FCP (threshold: 1.8 seconds)
    if (performanceData.first_contentful_paint > 1800) {
      performanceScore -= Math.min(20, Math.floor((performanceData.first_contentful_paint - 1800) / 100));
    }
    
    // Penalize for slow LCP (threshold: 2.5 seconds)
    if (performanceData.largest_contentful_paint > 2500) {
      performanceScore -= Math.min(30, Math.floor((performanceData.largest_contentful_paint - 2500) / 100));
    }
    
    // Ensure score is between 0 and 100
    performanceScore = Math.max(0, Math.min(100, performanceScore));

    // Prepare data for insertion
    const insertData = {
      page_url: performanceData.page_url,
      load_time: performanceData.load_time,
      page_size: performanceData.page_size || null,
      performance_score: performanceScore,
      first_contentful_paint: performanceData.first_contentful_paint || null,
      largest_contentful_paint: performanceData.largest_contentful_paint || null,
      cumulative_layout_shift: performanceData.cumulative_layout_shift || null,
      first_input_delay: performanceData.first_input_delay || null,
      resource_timings: performanceData.resource_timings || null,
      user_agent: performanceData.user_agent || req.headers.get('user-agent') || null
    };

    // Insert performance data
    const response = await fetch(`${supabaseUrl}/rest/v1/page_performance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Database insertion failed: ${errorData}`);
    }

    const insertedData = await response.json();

    // Return performance insights
    const insights = {
      score: performanceScore,
      rating: performanceScore >= 90 ? 'excellent' : 
             performanceScore >= 70 ? 'good' : 
             performanceScore >= 50 ? 'needs_improvement' : 'poor',
      recommendations: generateRecommendations(performanceData, performanceScore)
    };

    return new Response(JSON.stringify({ 
      success: true,
      data: insertedData[0],
      insights 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Performance monitoring error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateRecommendations(data: any, score: number): string[] {
  const recommendations = [];

  if (data.load_time > 3000) {
    recommendations.push('Sayfa yükleme süresini optimize edin (3 saniyeyi aşmamalı)');
  }

  if (data.first_contentful_paint && data.first_contentful_paint > 1800) {
    recommendations.push('İlk içerik boyamasını hızlandırın (kritik CSS inline kullanın)');
  }

  if (data.largest_contentful_paint && data.largest_contentful_paint > 2500) {
    recommendations.push('En büyük içerik boyamasını optimize edin (resim boyutları ve lazy loading)');
  }

  if (data.cumulative_layout_shift && data.cumulative_layout_shift > 0.1) {
    recommendations.push('Düzen kaymalarını önleyin (boyutları belirtilmemiş resimler)');
  }

  if (data.page_size && data.page_size > 1000000) {
    recommendations.push('Sayfa boyutunu azaltın (1MB altında olmalı, görsel optimizasyonu yapın)');
  }

  if (score < 70) {
    recommendations.push('Genel performans optimizasyonu gerekli (CDN, caching, minification)');
  }

  return recommendations;
}
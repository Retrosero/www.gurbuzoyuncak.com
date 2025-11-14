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
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseServiceKey) {
            throw new Error('Supabase service key not found');
        }

        const requestData = await req.json();
        const { 
            query, 
            categoryIds, 
            brandIds, 
            minPrice, 
            maxPrice, 
            inStockOnly, 
            sortBy = 'relevance',
            limit = 20, 
            offset = 0,
            searchType = 'advanced'
        } = requestData;

        // Supabase client
        const supabaseHeaders = {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
        };

        let searchResults = [];
        let searchTime = 0;
        let totalResults = 0;

        const startTime = Date.now();

        // Perform different search types
        if (searchType === 'fuzzy') {
            // Fuzzy search
            const fuzzyResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/fuzzy_product_search`, {
                method: 'POST',
                headers: supabaseHeaders,
                body: JSON.stringify({
                    p_query: query,
                    p_similarity_threshold: 0.3,
                    p_limit: limit
                })
            });

            if (fuzzyResponse.ok) {
                searchResults = await fuzzyResponse.json();
            }
        } else if (searchType === 'suggestions') {
            // Get suggestions
            const suggestionsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/get_search_suggestions`, {
                method: 'POST',
                headers: supabaseHeaders,
                body: JSON.stringify({
                    p_query: query,
                    p_limit: limit
                })
            });

            if (suggestionsResponse.ok) {
                searchResults = await suggestionsResponse.json();
                searchTime = Date.now() - startTime;
                
                return new Response(JSON.stringify({ 
                    success: true, 
                    data: searchResults,
                    searchTime,
                    query,
                    searchType: 'suggestions'
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        } else {
            // Advanced search
            const advancedResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/advanced_product_search`, {
                method: 'POST',
                headers: supabaseHeaders,
                body: JSON.stringify({
                    p_query: query,
                    p_category_ids: categoryIds || null,
                    p_brand_ids: brandIds || null,
                    p_min_price: minPrice || null,
                    p_max_price: maxPrice || null,
                    p_in_stock_only: inStockOnly || false,
                    p_sort_by: sortBy,
                    p_limit: limit,
                    p_offset: offset
                })
            });

            if (advancedResponse.ok) {
                searchResults = await advancedResponse.json();
            }
        }

        searchTime = Date.now() - startTime;
        totalResults = searchResults.length;

        // Log search query for analytics
        const userId = req.headers.get('user-id');
        const sessionId = req.headers.get('session-id') || crypto.randomUUID();

        await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/search_queries`, {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify({
                user_id: userId,
                session_id: sessionId,
                query_text: query,
                results_count: totalResults,
                search_type: searchType,
                filters_applied: {
                    categoryIds,
                    brandIds,
                    minPrice,
                    maxPrice,
                    inStockOnly,
                    sortBy
                },
                execution_time_ms: searchTime
            })
        });

        // Get search suggestions for the query
        const suggestionsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/get_search_suggestions`, {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify({
                p_query: query,
                p_limit: 5
            })
        });

        let suggestions = [];
        if (suggestionsResponse.ok) {
            suggestions = await suggestionsResponse.json();
        }

        // Get popular searches
        const popularResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/popular_searches?order=search_count.desc&limit=10`, {
            method: 'GET',
            headers: supabaseHeaders
        });

        let popularSearches = [];
        if (popularResponse.ok) {
            popularSearches = await popularResponse.json();
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                results: searchResults,
                total: totalResults,
                suggestions: suggestions,
                popularSearches: popularSearches,
                searchTime,
                filters: {
                    categoryIds,
                    brandIds,
                    minPrice,
                    maxPrice,
                    inStockOnly,
                    sortBy
                }
            },
            query,
            searchType: searchType,
            pagination: {
                limit,
                offset,
                hasMore: offset + limit < totalResults
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Search error:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
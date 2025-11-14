// Mobile API Gateway Edge Function
// Handles routing, authentication, rate limiting, and logging

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rate-limit, x-rate-remaining',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// API version
const API_VERSION = 'v1';

// Mobile API endpoints mapping
const API_ROUTES = {
  // Products
  '/api/v1/products': 'products-list',
  '/api/v1/products/(\\d+)': 'products-detail',
  
  // Categories
  '/api/v1/categories': 'categories-list',
  '/api/v1/categories/(\\d+)': 'categories-detail',
  
  // Auth
  '/api/v1/auth/login': 'auth-login',
  '/api/v1/auth/register': 'auth-register',
  '/api/v1/auth/refresh': 'auth-refresh',
  '/api/v1/auth/logout': 'auth-logout',
  
  // Cart
  '/api/v1/cart': 'cart-get',
  '/api/v1/cart/items': 'cart-add-item',
  '/api/v1/cart/items/(\\d+)': 'cart-update-item',
  '/api/v1/cart/clear': 'cart-clear',
  
  // Favorites
  '/api/v1/favorites': 'favorites-list',
  '/api/v1/favorites/check/(\\d+)': 'favorites-check',
  
  // Orders
  '/api/v1/orders': 'orders-list',
  '/api/v1/orders/(\\d+)': 'orders-detail',
  
  // User
  '/api/v1/user/profile': 'user-profile',
  
  // Notifications
  '/api/v1/notifications': 'notifications-list',
  '/api/v1/notifications/(\\d+)/read': 'notifications-read',
  
  // Search
  '/api/v1/search': 'search-products'
};

// Rate limiting
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // 100 requests per minute
  
  const clientData = rateLimitMap.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  if (clientData.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: clientData.resetTime };
  }
  
  clientData.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - clientData.count, 
    resetTime: clientData.resetTime 
  };
}

// Logging function
function logRequest(request: Request, response: Response, duration: number) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    status: response.status,
    duration: `${duration}ms`,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || 'unknown'
  };
  
  console.log('API Request:', JSON.stringify(logData));
}

// Authentication
async function authenticateRequest(request: Request, supabase: any): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return { user: null, error: 'Authorization header missing' };
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid token' };
    }
    
    return { user };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

// Route handler
async function handleRoute(
  routeName: string,
  method: string,
  url: URL,
  requestBody: any,
  user: any,
  supabase: any
): Promise<Response> {
  try {
    // Import and execute the appropriate handler
    const handler = await import(`../handlers/${routeName}.ts`);
    return await handler.default({
      method,
      url,
      body: requestBody,
      user,
      supabase,
      apiVersion: API_VERSION
    });
  } catch (error) {
    console.error(`Handler error for ${routeName}:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        route: routeName,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Main request handler
serve(async (req) => {
  const startTime = Date.now();
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Rate limiting
    const clientId = req.headers.get('x-client-id') || 
                    req.headers.get('x-forwarded-for') || 
                    'anonymous';
    
    const rateLimit = checkRateLimit(clientId);
    
    // Add rate limit headers
    const rateLimitHeaders = {
      ...corsHeaders,
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      'Content-Type': 'application/json'
    };
    
    if (!rateLimit.allowed) {
      logRequest(req, new Response('', { status: 429, headers: rateLimitHeaders }), Date.now() - startTime);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          timestamp: new Date().toISOString()
        }),
        {
          status: 429,
          headers: rateLimitHeaders
        }
      );
    }
    
    // Parse request body
    let requestBody = null;
    if (method !== 'GET') {
      try {
        requestBody = await req.json();
      } catch {
        requestBody = null;
      }
    }
    
    // Find matching route
    let matchedRoute = null;
    for (const [routePattern, routeName] of Object.entries(API_ROUTES)) {
      const regex = new RegExp('^' + routePattern + '$');
      if (regex.test(path)) {
        matchedRoute = routeName;
        break;
      }
    }
    
    if (!matchedRoute) {
      const response = new Response(
        JSON.stringify({
          error: 'API endpoint not found',
          path,
          method,
          timestamp: new Date().toISOString()
        }),
        { status: 404, headers: rateLimitHeaders }
      );
      logRequest(req, response, Date.now() - startTime);
      return response;
    }
    
    // Authenticate user (skip for public endpoints)
    const publicEndpoints = ['products-list', 'products-detail', 'categories-list', 'categories-detail', 'search-products'];
    let user = null;
    
    if (!publicEndpoints.includes(matchedRoute)) {
      const auth = await authenticateRequest(req, supabase);
      if (!auth.user) {
        const response = new Response(
          JSON.stringify({
            error: 'Authentication required',
            message: auth.error,
            timestamp: new Date().toISOString()
          }),
          { status: 401, headers: rateLimitHeaders }
        );
        logRequest(req, response, Date.now() - startTime);
        return response;
      }
      user = auth.user;
    }
    
    // Handle the route
    const response = await handleRoute(
      matchedRoute,
      method,
      url,
      requestBody,
      user,
      supabase
    );
    
    // Add rate limit headers to successful responses
    const responseHeaders = {
      ...response.headers,
      ...rateLimitHeaders
    };
    
    const finalResponse = new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
    
    logRequest(req, finalResponse, Date.now() - startTime);
    return finalResponse;
    
  } catch (error) {
    console.error('API Gateway Error:', error);
    const errorResponse = new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
    logRequest(req, errorResponse, Date.now() - startTime);
    return errorResponse;
  }
});
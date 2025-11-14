// Products API Handler
// Handles CRUD operations for products

interface HandlerContext {
  method: string;
  url: URL;
  body: any;
  user: any;
  supabase: any;
  apiVersion: string;
}

export default async function handler(context: HandlerContext): Promise<Response> {
  const { method, url, body, user, supabase } = context;
  const pathParts = url.pathname.split('/');
  const productId = pathParts[pathParts.length - 1];

  try {
    switch (method) {
      case 'GET':
        return await handleGetProducts(url, supabase);
      case 'POST':
        return await handleCreateProduct(body, user, supabase);
      case 'PUT':
        return await handleUpdateProduct(productId, body, user, supabase);
      case 'DELETE':
        return await handleDeleteProduct(productId, user, supabase);
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Products handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetProducts(url: URL, supabase: any): Promise<Response> {
  const searchParams = url.searchParams;
  
  // Parse query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      sale_price,
      category_id,
      brand,
      stock_quantity,
      status,
      created_at,
      updated_at,
      images,
      sku,
      tags,
      categories(id, name)
    `)
    .eq('status', 'active');

  // Apply filters
  if (category) {
    query = query.eq('category_id', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sort, { ascending: order === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: products, error, count } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return new Response(
    JSON.stringify({
      data: products,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      timestamp: new Date().toISOString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleCreateProduct(productData: any, user: any, supabase: any): Promise<Response> {
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'dealer')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prepare product data
  const newProduct = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    sale_price: productData.sale_price,
    category_id: productData.category_id,
    brand: productData.brand,
    stock_quantity: productData.stock_quantity || 0,
    status: productData.status || 'active',
    sku: productData.sku,
    tags: productData.tags || [],
    images: productData.images || [],
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create product', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      data,
      message: 'Product created successfully',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

async function handleUpdateProduct(productId: string, productData: any, user: any, supabase: any): Promise<Response> {
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'dealer')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prepare update data
  const updateData = {
    ...productData,
    updated_at: new Date().toISOString()
  };

  // Remove fields that shouldn't be updated directly
  delete updateData.id;
  delete updateData.created_at;
  delete updateData.created_by;

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update product', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      data,
      message: 'Product updated successfully',
      timestamp: new Date().toISOString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleDeleteProduct(productId: string, user: any, supabase: any): Promise<Response> {
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Soft delete - set status to inactive
  const { error } = await supabase
    .from('products')
    .update({ 
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete product', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      message: 'Product deleted successfully',
      timestamp: new Date().toISOString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
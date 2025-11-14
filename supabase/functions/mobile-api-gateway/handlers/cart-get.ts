// Cart API Handler
// Handles shopping cart operations

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

  try {
    // Check authentication for all cart operations
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (pathParts.includes('items')) {
      const itemId = pathParts[pathParts.length - 1];
      
      switch (method) {
        case 'POST':
          return await handleAddToCart(body, user, supabase);
        case 'PUT':
          return await handleUpdateCartItem(itemId, body, user, supabase);
        case 'DELETE':
          return await handleRemoveFromCart(itemId, user, supabase);
        default:
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { 'Content-Type': 'application/json' } }
          );
      }
    } else if (pathParts.includes('clear')) {
      if (method === 'DELETE') {
        return await handleClearCart(user, supabase);
      }
    } else {
      // Main cart endpoint
      switch (method) {
        case 'GET':
          return await handleGetCart(user, supabase);
        default:
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { 'Content-Type': 'application/json' } }
          );
      }
    }

  } catch (error) {
    console.error('Cart handler error:', error);
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

async function handleGetCart(user: any, supabase: any): Promise<Response> {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          description,
          price,
          sale_price,
          stock_quantity,
          images,
          sku
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cart', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    const itemsWithTotals = cartItems?.map(item => {
      const product = item.products;
      const price = product?.sale_price || product?.price || 0;
      const itemTotal = price * item.quantity;
      
      subtotal += itemTotal;
      itemCount += item.quantity;

      return {
        ...item,
        unit_price: price,
        total_price: itemTotal,
        product: {
          ...product,
          price: price,
          sale_price: product?.sale_price,
          in_stock: product?.stock_quantity > 0
        }
      };
    }) || [];

    return new Response(
      JSON.stringify({
        data: {
          items: itemsWithTotals,
          totals: {
            subtotal,
            item_count: itemCount,
            estimated_total: subtotal
          }
        },
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get cart', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleAddToCart(cartData: any, user: any, supabase: any): Promise<Response> {
  const { productId, quantity = 1 } = cartData;

  if (!productId) {
    return new Response(
      JSON.stringify({ error: 'Product ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify product exists and is available
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, status')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found or unavailable' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check stock availability
    if (product.stock_quantity < quantity) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient stock',
          available_stock: product.stock_quantity 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'active')
      .single();

    let result;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stock_quantity) {
        return new Response(
          JSON.stringify({ 
            error: 'Exceeds available stock',
            current_quantity: existingItem.quantity,
            available_stock: product.stock_quantity 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      result = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            sale_price,
            images
          )
        `)
        .single();
    } else {
      // Add new item
      result = await supabase
        .from('cart_items')
        .insert([{
          user_id: user.id,
          product_id: productId,
          quantity,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            sale_price,
            images
          )
        `)
        .single();
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: 'Failed to add item to cart', details: result.error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data: result.data,
        message: 'Item added to cart successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to add item to cart', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleUpdateCartItem(itemId: string, updateData: any, user: any, supabase: any): Promise<Response> {
  const { quantity } = updateData;

  if (!quantity || quantity < 1) {
    return new Response(
      JSON.stringify({ error: 'Valid quantity is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify item exists and belongs to user
    const { data: cartItem, error: itemError } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (itemError || !cartItem) {
      return new Response(
        JSON.stringify({ error: 'Cart item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check stock availability
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', cartItem.product_id)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (quantity > product.stock_quantity) {
      return new Response(
        JSON.stringify({ 
          error: 'Exceeds available stock',
          available_stock: product.stock_quantity 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update item
    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          price,
          sale_price,
          images
        )
      `)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update cart item', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data,
        message: 'Cart item updated successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update cart item', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRemoveFromCart(itemId: string, user: any, supabase: any): Promise<Response> {
  try {
    // Verify item exists and belongs to user
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to remove item from cart', details: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Item removed from cart successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to remove item from cart', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleClearCart(user: any, supabase: any): Promise<Response> {
  try {
    // Remove all items for the user
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to clear cart', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Cart cleared successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to clear cart', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
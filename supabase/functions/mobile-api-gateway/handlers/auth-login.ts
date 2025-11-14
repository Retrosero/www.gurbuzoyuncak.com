// Authentication API Handler
// Handles user authentication, registration, and token management

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
  const action = pathParts[pathParts.length - 1];

  try {
    switch (action) {
      case 'login':
        return await handleLogin(body, supabase);
      case 'register':
        return await handleRegister(body, supabase);
      case 'refresh':
        return await handleRefreshToken(body, supabase);
      case 'logout':
        return await handleLogout(user, supabase);
      default:
        return new Response(
          JSON.stringify({ error: 'Auth endpoint not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Auth handler error:', error);
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

async function handleLogin(credentials: any, supabase: any): Promise<Response> {
  const { email, password } = credentials;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials', message: error.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Log successful login
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: data.user.id,
        action: 'login',
        details: { email },
        created_at: new Date().toISOString()
      }]);

    return new Response(
      JSON.stringify({
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'customer',
            name: profile?.full_name
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
          }
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Login failed', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRegister(userData: any, supabase: any): Promise<Response> {
  const { email, password, full_name, phone, role = 'customer' } = userData;

  if (!email || !password || !full_name) {
    return new Response(
      JSON.stringify({ error: 'Email, password, and full name are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
          role
        }
      }
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Registration failed', message: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email,
          full_name,
          phone,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    // Log registration
    await supabase
      .from('activity_logs')
      .insert([{
        user_id: data.user?.id,
        action: 'register',
        details: { email, role },
        created_at: new Date().toISOString()
      }]);

    return new Response(
      JSON.stringify({
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            role,
            name: full_name
          },
          message: data.user?.email_confirmed_at ? 
            'Registration successful' : 
            'Registration successful. Please check your email to confirm your account.'
        },
        timestamp: new Date().toISOString()
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Registration failed', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRefreshToken(refreshData: any, supabase: any): Promise<Response> {
  const { refresh_token } = refreshData;

  if (!refresh_token) {
    return new Response(
      JSON.stringify({ error: 'Refresh token is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid refresh token', message: error.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Token refresh failed', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleLogout(user: any, supabase: any): Promise<Response> {
  try {
    // Sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Logout failed', message: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log logout
    if (user) {
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action: 'logout',
          details: {},
          created_at: new Date().toISOString()
        }]);
    }

    return new Response(
      JSON.stringify({
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Logout failed', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
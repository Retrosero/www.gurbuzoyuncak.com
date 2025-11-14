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
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
        }

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'create';

        switch (action) {
            case 'create':
                return await handleSessionCreate(req, corsHeaders, supabaseServiceKey);
            case 'validate':
                return await handleSessionValidate(req, corsHeaders, supabaseServiceKey);
            case 'destroy':
                return await handleSessionDestroy(req, corsHeaders, supabaseServiceKey);
            case 'list':
                return await handleSessionList(req, corsHeaders, supabaseServiceKey);
            case 'cleanup':
                return await handleSessionCleanup(req, corsHeaders, supabaseServiceKey);
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('Session manager error:', error);

        const errorResponse = {
            error: {
                code: 'SESSION_MANAGER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function handleSessionCreate(req: Request, corsHeaders: any, serviceKey: string) {
    const requestData = await req.json();
    const { user_id, ip_address, user_agent } = requestData;

    const profileResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${user_id}&select=account_locked_until,is_active`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles.length > 0) {
            const profile = profiles[0];
            
            if (!profile.is_active) {
                throw new Error('Account is deactivated');
            }

            if (profile.account_locked_until) {
                const lockUntil = new Date(profile.account_locked_until);
                if (lockUntil > new Date()) {
                    throw new Error('Account is locked');
                }
            }
        }
    }

    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?user_id=eq.${user_id}&is_active=eq.true`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            is_active: false,
            last_activity: new Date().toISOString()
        })
    });

    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            user_id,
            session_token: sessionToken,
            ip_address,
            user_agent,
            expires_at: expiresAt.toISOString(),
            is_active: true
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create session');
    }

    const data = await response.json();

    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${user_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            last_login: new Date().toISOString(),
            failed_login_attempts: 0
        })
    });

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/activity-logger`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id,
            activity_type: 'login',
            resource_type: 'session',
            resource_id: sessionToken,
            details: { ip_address, user_agent }
        })
    });

    return new Response(JSON.stringify({ 
        success: true, 
        data: {
            session_token: sessionToken,
            expires_at: expiresAt.toISOString(),
            user_id
        },
        message: 'Session created successfully' 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleSessionValidate(req: Request, corsHeaders: any, serviceKey: string) {
    const requestData = await req.json();
    const { session_token } = requestData;

    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?session_token=eq.${session_token}&is_active=eq.true`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to validate session');
    }

    const sessions = await response.json();
    if (sessions.length === 0) {
        throw new Error('Invalid or expired session');
    }

    const session = sessions[0];

    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?session_token=eq.${session_token}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_active: false
            })
        });

        throw new Error('Session expired');
    }

    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?session_token=eq.${session_token}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            last_activity: new Date().toISOString()
        })
    });

    return new Response(JSON.stringify({ 
        success: true, 
        data: {
            user_id: session.user_id,
            valid: true,
            expires_at: session.expires_at
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleSessionDestroy(req: Request, corsHeaders: any, serviceKey: string) {
    const requestData = await req.json();
    const { session_token } = requestData;

    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?session_token=eq.${session_token}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            is_active: false,
            last_activity: new Date().toISOString()
        })
    });

    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Session destroyed successfully' 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleSessionList(req: Request, corsHeaders: any, serviceKey: string) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
        throw new Error('user_id parameter required');
    }

    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?user_id=eq.${userId}&order=created_at.desc`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const data = await response.json();

    return new Response(JSON.stringify({ 
        success: true, 
        data: data
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleSessionCleanup(req: Request, corsHeaders: any, serviceKey: string) {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_sessions?expires_at=lt.${new Date().toISOString()}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            is_active: false
        })
    });

    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Expired sessions cleaned up' 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

function generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
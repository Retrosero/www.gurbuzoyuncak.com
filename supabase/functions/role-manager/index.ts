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
        const action = url.searchParams.get('action') || 'list';

        // İsteği yapan kullanıcının rolünü kontrol et
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Authorization header required');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': supabaseServiceKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Kullanıcının rolünü kontrol et
        const profileResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${userId}&select=role`, {
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
            }
        });

        const profiles = await profileResponse.json();
        if (profiles.length === 0 || profiles[0].role !== 'admin') {
            throw new Error('Insufficient permissions');
        }

        switch (action) {
            case 'update':
                return await handleRoleUpdate(req, corsHeaders, supabaseServiceKey);
            case 'list':
                return await handleListUsers(req, corsHeaders, supabaseServiceKey);
            case 'permissions':
                return await handlePermissions(req, corsHeaders, supabaseServiceKey);
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('Role manager error:', error);

        const errorResponse = {
            error: {
                code: 'ROLE_MANAGER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Kullanıcı rolünü güncelle
async function handleRoleUpdate(req: Request, corsHeaders: any, serviceKey: string) {
    const requestData = await req.json();
    const { target_user_id, new_role } = requestData;

    // Geçerli roller
    const validRoles = ['admin', 'moderator', 'editor', 'bayi', 'user'];
    if (!validRoles.includes(new_role)) {
        throw new Error('Invalid role');
    }

    // Profili güncelle
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${target_user_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            role: new_role,
            updated_at: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error('Failed to update user role');
    }

    const data = await response.json();

    // Aktivite logla
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/activity-logger`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: target_user_id,
            activity_type: 'role_change',
            resource_type: 'user',
            resource_id: target_user_id,
            details: { new_role, changed_by: 'admin' }
        })
    });

    return new Response(JSON.stringify({ 
        success: true, 
        data: data,
        message: 'User role updated successfully' 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Kullanıcıları listele
async function handleListUsers(req: Request, corsHeaders: any, serviceKey: string) {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?select=*&order=created_at.desc`, {
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

// İzin bilgilerini getir
async function handlePermissions(req: Request, corsHeaders: any, serviceKey: string) {
    const permissions = {
        admin: {
            description: 'Tam yetki',
            can_manage_users: true,
            can_manage_roles: true,
            can_view_logs: true,
            can_manage_products: true,
            can_manage_orders: true,
            can_manage_backups: true,
            can_access_all_sections: true
        },
        moderator: {
            description: 'Moderatör - Ürün/kategori yönetimi',
            can_manage_users: false,
            can_manage_roles: false,
            can_view_logs: true,
            can_manage_products: true,
            can_manage_orders: true,
            can_manage_backups: false,
            can_access_all_sections: false
        },
        editor: {
            description: 'Editör - İçerik düzenleme',
            can_manage_users: false,
            can_manage_roles: false,
            can_view_logs: false,
            can_manage_products: true,
            can_manage_orders: false,
            can_manage_backups: false,
            can_access_all_sections: false
        },
        bayi: {
            description: 'Bayi paneli erişimi',
            can_manage_users: false,
            can_manage_roles: false,
            can_view_logs: false,
            can_manage_products: false,
            can_manage_orders: true,
            can_manage_backups: false,
            can_access_all_sections: false
        },
        user: {
            description: 'Normal kullanıcı',
            can_manage_users: false,
            can_manage_roles: false,
            can_view_logs: false,
            can_manage_products: false,
            can_manage_orders: false,
            can_manage_backups: false,
            can_access_all_sections: false
        }
    };

    return new Response(JSON.stringify({ 
        success: true, 
        data: permissions
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
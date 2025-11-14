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

        const requestData = await req.json();
        const { 
            user_id, 
            activity_type, 
            resource_type, 
            resource_id, 
            details, 
            ip_address, 
            user_agent, 
            session_id 
        } = requestData;

        // Kullanıcı rolünü kontrol et
        const profileResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${user_id}&select=role,is_active`, {
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const profiles = await profileResponse.json();
        if (profiles.length === 0 || !profiles[0].is_active) {
            throw new Error('User not found or inactive');
        }

        // Aktivite logunu kaydet
        const logResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/user_activities`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id,
                activity_type,
                resource_type,
                resource_id,
                details,
                ip_address,
                user_agent,
                session_id,
                created_at: new Date().toISOString()
            })
        });

        if (!logResponse.ok) {
            const errorText = await logResponse.text();
            throw new Error(`Failed to log activity: ${errorText}`);
        }

        const logData = await logResponse.json();

        return new Response(JSON.stringify({ 
            success: true, 
            data: logData,
            message: 'Activity logged successfully' 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Activity logger error:', error);

        const errorResponse = {
            error: {
                code: 'ACTIVITY_LOG_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
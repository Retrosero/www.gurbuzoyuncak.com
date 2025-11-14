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
            event_type, 
            user_id, 
            ip_address, 
            user_agent, 
            details, 
            severity = 'low' 
        } = requestData;

        // Güvenlik logunu kaydet
        const logResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/security_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                event_type,
                user_id,
                ip_address,
                user_agent,
                details,
                severity,
                created_at: new Date().toISOString()
            })
        });

        if (!logResponse.ok) {
            const errorText = await logResponse.text();
            throw new Error(`Failed to log security event: ${errorText}`);
        }

        const logData = await logResponse.json();

        // Yüksek önem seviyesi olaylar için ek işlemler
        if (severity === 'high' || severity === 'critical') {
            // Hesap kilitleme kontrolü
            if (event_type === 'failed_login' && user_id) {
                await handleFailedLogin(user_id, ip_address, supabaseServiceKey);
            }

            // Admin'e bildirim (gelecekte email notification sistemi eklenebilir)
            console.log(`High priority security event: ${event_type} for user ${user_id}`);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            data: logData,
            message: 'Security event logged successfully' 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Security monitor error:', error);

        const errorResponse = {
            error: {
                code: 'SECURITY_MONITOR_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Başarısız giriş denemelerini işle
async function handleFailedLogin(userId: string, ipAddress: string, serviceKey: string) {
    try {
        // Mevcut başarısız deneme sayısını al
        const profileResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${userId}&select=failed_login_attempts,account_locked_until`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey
            }
        });

        if (profileResponse.ok) {
            const profiles = await profileResponse.json();
            if (profiles.length > 0) {
                const profile = profiles[0];
                const currentAttempts = profile.failed_login_attempts || 0;
                const newAttempts = currentAttempts + 1;

                let updateData: any = {
                    failed_login_attempts: newAttempts
                };

                // 5 başarısız deneme sonrası hesabı kilitle
                if (newAttempts >= 5) {
                    const lockUntil = new Date();
                    lockUntil.setHours(lockUntil.getHours() + 1); // 1 saat kilitle

                    updateData.account_locked_until = lockUntil.toISOString();
                }

                // Profili güncelle
                await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceKey}`,
                        'apikey': serviceKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
            }
        }
    } catch (error) {
        console.error('Failed login handling error:', error);
    }
}
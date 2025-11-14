Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { user_id } = await req.json();

        if (!user_id) {
            throw new Error('user_id gerekli');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // 1. Kullanıcının profil bilgilerini al
        const profileRes = await fetch(
            `${supabaseUrl}/rest/v1/profiles?user_id=eq.${user_id}&select=loyalty_points,vip_level`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );

        let vipInfo = null;
        if (profileRes.ok) {
            const profiles = await profileRes.json();
            if (profiles && profiles.length > 0) {
                const profile = profiles[0];
                const userTierLevel = profile.vip_level || 1;
                
                // VIP tier bilgilerini al
                const tierRes = await fetch(
                    `${supabaseUrl}/rest/v1/vip_tiers?tier_level=eq.${userTierLevel}&select=*`,
                    {
                        headers: {
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`
                        }
                    }
                );

                if (tierRes.ok) {
                    const tiers = await tierRes.json();
                    if (tiers && tiers.length > 0) {
                        const tier = tiers[0];
                        vipInfo = {
                            points: profile.loyalty_points || 0,
                            tier_level: userTierLevel,
                            tier_name: tier.tier_name,
                            tier_icon: tier.icon_emoji,
                            discount_percentage: tier.discount_percentage,
                            free_shipping_threshold: tier.free_shipping_threshold,
                            perks: tier.perks,
                            next_tier: null // Şimdilik basit versiyon
                        };
                    }
                }
            }
        }

        // 2. Son 10 puan işlemini al
        const transactionsRes = await fetch(
            `${supabaseUrl}/rest/v1/point_transactions?user_id=eq.${user_id}&select=*&order=created_at.desc&limit=10`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );

        const transactions = await transactionsRes.json();

        // 3. Tüm VIP seviyelerini al
        const tiersRes = await fetch(
            `${supabaseUrl}/rest/v1/vip_tiers?select=*&order=tier_level.asc`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );

        const tiers = await tiersRes.json();

        // 4. Puan kazanma kurallarını al
        const rulesRes = await fetch(
            `${supabaseUrl}/rest/v1/point_rules?is_active=eq.true&select=*`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );

        const rules = await rulesRes.json();

        return new Response(JSON.stringify({
            success: true,
            data: {
                vip_info: vipInfo,
                recent_transactions: transactions || [],
                all_tiers: tiers || [],
                point_rules: rules || []
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Sadakat bilgisi alma hatası:', error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Sadakat bilgisi alınamadı'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

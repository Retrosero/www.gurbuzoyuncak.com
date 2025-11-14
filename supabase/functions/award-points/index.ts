import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    }

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { 
            user_id, 
            points,
            action_type,  // Frontend'den gelen parametre
            description = '',
            order_total = null
        } = await req.json()

        if (!user_id || !action_type) {
            throw new Error('user_id ve action_type gerekli')
        }

        // action_type → transaction_type dönüşümü
        const transaction_type = action_type

        // Kullanıcının eski VIP seviyesini al
        const { data: userBefore, error: userError } = await supabase
            .from('profiles')
            .select('vip_level, loyalty_points, email, full_name')
            .eq('user_id', user_id)
            .single()

        if (userError) throw userError

        const oldLevel = userBefore?.vip_level || 1
        const oldPoints = userBefore?.loyalty_points || 0

        // İlk sipariş kontrolü
        let isFirstOrder = false
        if (transaction_type === 'purchase' && order_total) {
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user_id)
                .eq('status', 'confirmed')

            isFirstOrder = count === 0 || count === 1
        }

        // Puan ekle (database function kullan)
        const finalPoints = points || 0
        const { data: addResult, error: addError } = await supabase
            .rpc('add_loyalty_points', {
                p_user_id: user_id,
                p_transaction_type: transaction_type,
                p_points: finalPoints,
                p_description: description,
                p_order_id: null,
                p_reference_id: null
            })

        if (addError) throw addError

        // İlk sipariş bonusu ekle
        if (isFirstOrder) {
            const { data: firstOrderRule } = await supabase
                .from('point_rules')
                .select('points_awarded')
                .eq('rule_type', 'first_order')
                .single()

            if (firstOrderRule) {
                await supabase.rpc('add_loyalty_points', {
                    p_user_id: user_id,
                    p_transaction_type: 'first_order',
                    p_points: firstOrderRule.points_awarded,
                    p_description: '🎉 İlk sipariş bonusu!',
                    p_order_id: null,
                    p_reference_id: null
                })
            }
        }

        // Güncel kullanıcı bilgisini al (VIP seviyesi güncellendi mi?)
        const { data: userAfter, error: userAfterError } = await supabase
            .from('profiles')
            .select('vip_level, loyalty_points')
            .eq('user_id', user_id)
            .single()

        if (userAfterError) throw userAfterError

        const newLevel = userAfter?.vip_level || 1
        const newPoints = userAfter?.loyalty_points || 0

        // VIP seviyesi değişimi kontrolü
        let levelUpInfo = null
        if (newLevel > oldLevel) {
            // Yeni seviye bilgisini al
            const { data: newTier } = await supabase
                .from('vip_tiers')
                .select('*')
                .eq('tier_level', newLevel)
                .single()

            levelUpInfo = {
                level_changed: true,
                old_level: oldLevel,
                new_level: newLevel,
                new_tier_name: newTier?.tier_name || '',
                new_tier_emoji: newTier?.icon_emoji || '',
                new_discount: newTier?.discount_percentage || 0,
                benefits: newTier?.perks || []
            }

            // VIP seviye atlama bildirimi (console log)
            console.log('🎊 VIP LEVEL UP! 🎊')
            console.log(`User: ${userBefore.email}`)
            console.log(`Level: ${oldLevel} → ${newLevel} (${newTier?.tier_name} ${newTier?.icon_emoji})`)
            console.log(`Points: ${oldPoints} → ${newPoints}`)
            console.log(`New discount: ${newTier?.discount_percentage}%`)
            
            // TODO: E-posta gönderme kodu buraya eklenebilir
        }

        // Sonraki seviye bilgisini al
        const { data: nextTier } = await supabase
            .from('vip_tiers')
            .select('*')
            .gt('tier_level', newLevel)
            .order('tier_level')
            .limit(1)
            .single()

        const pointsToNext = nextTier ? nextTier.min_points - newPoints : 0

        return new Response(JSON.stringify({
            data: {
                success: true,
                points_awarded: finalPoints,
                first_order_bonus: isFirstOrder,
                total_points: newPoints,
                vip_level: newLevel,
                level_up: levelUpInfo,
                next_level: nextTier ? {
                    level: nextTier.tier_level,
                    name: nextTier.tier_name,
                    emoji: nextTier.icon_emoji,
                    points_required: nextTier.min_points,
                    points_to_go: pointsToNext,
                    progress_percentage: nextTier.min_points > 0 
                        ? Math.min(100, (newPoints / nextTier.min_points) * 100)
                        : 100
                } : null
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error('Award points error:', error)

        return new Response(JSON.stringify({
            error: {
                code: 'AWARD_POINTS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

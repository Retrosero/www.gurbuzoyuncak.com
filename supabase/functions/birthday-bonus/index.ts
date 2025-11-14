import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Bu fonksiyon her gün çalışacak ve bugün doğum günü olan kullanıcılara otomatik puan verecek
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Bugünün tarihini al (ay-gün formatında)
        const today = new Date()
        const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
        const todayDay = String(today.getDate()).padStart(2, '0')
        const todayMMDD = `${todayMonth}-${todayDay}`

        console.log('Birthday bonus check for:', todayMMDD)

        // Doğum günü bonusu puan miktarını al
        const { data: pointRule, error: ruleError } = await supabase
            .from('point_rules')
            .select('points_awarded')
            .eq('rule_type', 'birthday_bonus')
            .single()

        if (ruleError || !pointRule) {
            console.error('Birthday point rule not found:', ruleError)
            return new Response(JSON.stringify({
                data: { 
                    message: 'Birthday point rule not found',
                    processed: 0
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const birthdayPoints = pointRule.points_awarded

        // Bugün doğum günü olan kullanıcıları bul
        // birth_date formatı: YYYY-MM-DD
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, email, full_name, birth_date')
            .not('birth_date', 'is', null)

        if (profilesError) {
            throw profilesError
        }

        // Bugün doğum günü olanları filtrele
        const birthdayUsers = profiles?.filter(profile => {
            if (!profile.birth_date) return false
            const birthDate = new Date(profile.birth_date)
            const birthMonth = String(birthDate.getMonth() + 1).padStart(2, '0')
            const birthDay = String(birthDate.getDate()).padStart(2, '0')
            const birthMMDD = `${birthMonth}-${birthDay}`
            return birthMMDD === todayMMDD
        }) || []

        console.log(`Found ${birthdayUsers.length} birthday users`)

        // Bu yıl zaten bonus verilmiş mi kontrol et
        const processedUsers = []
        const skippedUsers = []

        for (const profile of birthdayUsers) {
            // Bu yıl doğum günü bonusu verilmiş mi kontrol et
            const thisYear = today.getFullYear()
            const yearStart = new Date(thisYear, 0, 1).toISOString()
            const yearEnd = new Date(thisYear, 11, 31, 23, 59, 59).toISOString()

            const { data: existingBonus } = await supabase
                .from('point_transactions')
                .select('id')
                .eq('user_id', profile.user_id)
                .eq('transaction_type', 'birthday_bonus')
                .gte('created_at', yearStart)
                .lte('created_at', yearEnd)
                .limit(1)

            if (existingBonus && existingBonus.length > 0) {
                console.log(`Birthday bonus already given to ${profile.email} this year`)
                skippedUsers.push(profile.email)
                continue
            }

            // Puan ver
            const { error: pointsError } = await supabase.functions.invoke('award-points', {
                body: { 
                    user_id: profile.user_id, 
                    points: birthdayPoints,
                    action_type: 'birthday_bonus',
                    description: `🎂 Doğum günün kutlu olsun! ${today.getFullYear()}`
                }
            })

            if (pointsError) {
                console.error(`Failed to award birthday points to ${profile.email}:`, pointsError)
                skippedUsers.push(profile.email)
            } else {
                console.log(`Birthday bonus awarded to ${profile.email}: ${birthdayPoints} points`)
                processedUsers.push(profile.email)
                
                // TODO: E-posta gönder (opsiyonel)
                // Doğum günü tebrik e-postası gönderme kodu buraya eklenebilir
            }
        }

        return new Response(JSON.stringify({
            data: {
                success: true,
                date: todayMMDD,
                points_awarded: birthdayPoints,
                total_birthday_users: birthdayUsers.length,
                processed: processedUsers.length,
                skipped: skippedUsers.length,
                processed_users: processedUsers,
                skipped_users: skippedUsers
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error('Birthday bonus error:', error)

        return new Response(JSON.stringify({
            error: {
                code: 'BIRTHDAY_BONUS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

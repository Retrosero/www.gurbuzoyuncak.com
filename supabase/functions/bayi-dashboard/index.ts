Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    }

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const requestData = await req.json();
        const { user_id } = requestData;

        // Kullanıcı kontrolü
        if (!user_id) {
            throw new Error('Kullanıcı ID gerekli')
        }

        // Kullanıcı profilini al
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&user_id=eq.${user_id}`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        const profileData = await profileResponse.json();
        if (!profileData || profileData.length === 0) {
            throw new Error('Profil bulunamadı');
        }

        const profile = profileData[0];

        // Bayi kontrolü
        if (!profile.is_bayi && !['B2B', 'Toptan', 'Kurumsal'].includes(profile.customer_type)) {
            throw new Error('Bu alan sadece bayiler içindir');
        }

        // Dashboard istatistikleri
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        // Bu ay işlemler
        const monthStart = new Date(currentYear, currentMonth - 1, 1).toISOString()
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString()

        // Bu ay işlemler
        const monthlyResponse = await fetch(`${supabaseUrl}/rest/v1/balance_transactions?select=*&user_id=eq.${user_id}&created_at=gte.${monthStart}&created_at=lte.${monthEnd}`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });
        const monthlyTransactions = await monthlyResponse.json();

        // Aylık özet
        const monthlyDeposits = monthlyTransactions?.filter(t => t.transaction_type === 'deposit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
        
        const monthlyPurchases = monthlyTransactions?.filter(t => t.transaction_type === 'purchase')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

        // Son 10 işlem
        const recentResponse = await fetch(`${supabaseUrl}/rest/v1/balance_transactions?select=*&user_id=eq.${user_id}&order=created_at.desc&limit=10`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });
        const recentTransactions = await recentResponse.json();

        // Son bakiye yükleme
        const lastDepositResponse = await fetch(`${supabaseUrl}/rest/v1/balance_transactions?select=*&user_id=eq.${user_id}&transaction_type=eq.deposit&order=created_at.desc&limit=1`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });
        const lastDepositData = await lastDepositResponse.json();
        const lastDeposit = lastDepositData.length > 0 ? lastDepositData[0] : null;

        // Toplam istatistikler
        const allTransactionsResponse = await fetch(`${supabaseUrl}/rest/v1/balance_transactions?select=amount,transaction_type&user_id=eq.${user_id}`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });
        const allTransactions = await allTransactionsResponse.json();

        const totalDeposits = allTransactions?.filter(t => t.transaction_type === 'deposit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
        
        const totalPurchases = allTransactions?.filter(t => t.transaction_type === 'purchase')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

        return new Response(JSON.stringify({
            data: {
                stats: {
                    current_balance: parseFloat(profile.balance || 0),
                    monthly_deposits: monthlyDeposits,
                    monthly_purchases: monthlyPurchases,
                    transaction_count: monthlyTransactions?.length || 0,
                    vip_level: profile.vip_level || 1,
                    dealer_company_name: profile.dealer_company_name || profile.company_name || profile.full_name
                },
                recent_transactions: recentTransactions?.map(t => ({
                    id: t.id,
                    transaction_type: t.transaction_type,
                    amount: parseFloat(t.amount),
                    description: t.description,
                    created_at: t.created_at
                })) || []
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error('Bayi dashboard error:', error)

        return new Response(JSON.stringify({
            error: {
                code: 'DEALER_DASHBOARD_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

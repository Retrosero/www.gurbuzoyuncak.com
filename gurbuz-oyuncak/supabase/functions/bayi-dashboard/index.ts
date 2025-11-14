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
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_USER_ID', message: 'User ID gerekli' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Bayi profilini al
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!profileResponse.ok) {
      throw new Error('Profil alınamadı')
    }

    const profiles = await profileResponse.json()
    const profile = profiles[0]

    if (!profile) {
      return new Response(
        JSON.stringify({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profil bulunamadı' } }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Bu ay için tarih aralığı
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    // Bu ay bakiye yüklemelerini al
    const depositsResponse = await fetch(
      `${supabaseUrl}/rest/v1/balance_transactions?user_id=eq.${user_id}&transaction_type=eq.deposit&created_at=gte.${startOfMonth}&created_at=lte.${endOfMonth}&select=amount`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const deposits = await depositsResponse.json()
    const monthlyDeposits = deposits.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

    // Bu ay siparişleri al
    const ordersResponse = await fetch(
      `${supabaseUrl}/rest/v1/orders?user_id=eq.${user_id}&created_at=gte.${startOfMonth}&created_at=lte.${endOfMonth}&select=total_amount`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const orders = await ordersResponse.json()
    const monthlyPurchases = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

    // Bu ay işlem sayısı
    const transactionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/balance_transactions?user_id=eq.${user_id}&created_at=gte.${startOfMonth}&created_at=lte.${endOfMonth}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      }
    )

    const transactionCount = parseInt(transactionsResponse.headers.get('content-range')?.split('/')[1] || '0')

    // Son işlemler
    const recentTransactionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/balance_transactions?user_id=eq.${user_id}&select=id,amount,transaction_type,description,created_at&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const recentTransactions = await recentTransactionsResponse.json()

    const stats = {
      current_balance: profile.balance || 0,
      monthly_deposits: monthlyDeposits,
      monthly_purchases: monthlyPurchases,
      transaction_count: transactionCount,
      vip_level: profile.vip_level || 1,
      dealer_company_name: profile.dealer_company_name || profile.company_name || profile.full_name || 'Bayi'
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stats,
          recent_transactions: recentTransactions
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Dashboard error:', error)
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Bilinmeyen hata'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

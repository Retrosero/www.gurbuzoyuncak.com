// Demo bayi kullanıcısı oluşturma (tek seferlik)
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

    // 1. Create auth user
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: 'abc@oyuncak.com',
        password: 'DemoB@yi123',
        email_confirm: true,
        user_metadata: {
          full_name: 'ABC Oyuncak Bayisi'
        }
      })
    })

    if (!createUserResponse.ok) {
      const error = await createUserResponse.text()
      throw new Error(`User creation failed: ${error}`)
    }

    const userData = await createUserResponse.json()
    const userId = userData.id

    // 2. Update profile
    const updateProfileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        customer_type: 'B2B',
        dealer_company_name: 'ABC Oyuncak',
        dealer_approved: true,
        dealer_approval_date: new Date().toISOString(),
        balance: 2450.00,
        vip_level: 3,
        loyalty_points: 750,
        full_name: 'ABC Oyuncak Bayisi',
        phone: '0 (555) 123 45 67'
      })
    })

    if (!updateProfileResponse.ok) {
      const error = await updateProfileResponse.text()
      throw new Error(`Profile update failed: ${error}`)
    }

    // 3. Add demo transactions
    const transactions = [
      {
        user_id: userId,
        transaction_type: 'deposit',
        amount: 5000.00,
        description: 'İlk bakiye yüklemesi',
        balance_after: 5000.00
      },
      {
        user_id: userId,
        transaction_type: 'purchase',
        amount: -2550.00,
        description: 'Ocak 2025 toptan alımı',
        balance_after: 2450.00
      }
    ]

    await fetch(`${SUPABASE_URL}/rest/v1/balance_transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify(transactions)
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo bayi kullanıcısı başarıyla oluşturuldu',
        user_id: userId,
        email: 'abc@oyuncak.com',
        password: 'DemoB@yi123'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

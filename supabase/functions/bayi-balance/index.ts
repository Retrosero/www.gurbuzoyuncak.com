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

        const requestData = await req.json()
        const { 
            action,  // 'request_load', 'get_transactions'
            amount,
            note,
            page,
            limit,
            transaction_type,
            start_date,
            end_date
        } = requestData

        if (!action) {
            throw new Error('action gerekli')
        }

        // Authorization
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Authorization gerekli')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)
        
        if (userError || !user) {
            throw new Error('Geçersiz token')
        }

        // Bayi kontrolü
        const { data: profile } = await supabase
            .from('profiles')
            .select('customer_type, dealer_approved')
            .eq('user_id', user.id)
            .single()

        if (!profile || !['B2B', 'Toptan', 'Kurumsal'].includes(profile.customer_type) || !profile.dealer_approved) {
            throw new Error('Sadece onaylı bayiler için')
        }

        // İşleme göre aksiyon
        if (action === 'request_load') {
            // Bakiye yükleme talebi
            if (!amount || amount <= 0) {
                throw new Error('Geçerli bir tutar girin')
            }

            const { data: result, error: updateError } = await supabase
                .rpc('update_user_balance', {
                    p_user_id: user.id,
                    p_transaction_type: 'deposit',
                    p_amount: amount,
                    p_description: note || 'Bakiye yükleme talebi',
                    p_reference_id: null
                })

            if (updateError) throw updateError

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Bakiye yükleme talebi onaylandı',
                    transaction: result
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (action === 'get_transactions') {
            // Bakiye geçmişi
            const pageNum = page || 1
            const limitNum = limit || 20
            const offset = (pageNum - 1) * limitNum

            let query = supabase
                .from('balance_transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Filtreler
            if (transaction_type && transaction_type !== 'all') {
                query = query.eq('transaction_type', transaction_type)
            }
            if (start_date) {
                query = query.gte('created_at', start_date)
            }
            if (end_date) {
                query = query.lte('created_at', end_date + 'T23:59:59')
            }

            const { data: transactions, count, error: txError } = await query
                .range(offset, offset + limitNum - 1)

            if (txError) throw txError

            return new Response(JSON.stringify({
                data: {
                    transactions: transactions || [],
                    total_count: count || 0
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        throw new Error('Geçersiz action')

    } catch (error: any) {
        console.error('Bayi balance error:', error)

        return new Response(JSON.stringify({
            error: {
                code: 'DEALER_BALANCE_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

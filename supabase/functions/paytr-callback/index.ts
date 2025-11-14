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

        // PayTR'dan gelen form data'yı al
        const formData = await req.formData()
        const merchant_oid = formData.get('merchant_oid') as string
        const status = formData.get('status') as string
        const total_amount = formData.get('total_amount') as string
        const hash = formData.get('hash') as string
        const failed_reason_code = formData.get('failed_reason_code') as string || ''
        const failed_reason_msg = formData.get('failed_reason_msg') as string || ''

        console.log('PayTR Callback received:', { merchant_oid, status, total_amount })

        // Hash kontrolü (güvenlik)
        const MERCHANT_KEY = Deno.env.get('PAYTR_MERCHANT_KEY') || ''
        const MERCHANT_SALT = Deno.env.get('PAYTR_MERCHANT_SALT') || ''
        
        const hashString = `${merchant_oid}${MERCHANT_SALT}${status}${total_amount}`
        const encoder = new TextEncoder()
        const data = encoder.encode(hashString)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        
        // PayTR hash format kontrolü (base64)
        const expectedHashBase64 = btoa(calculatedHash)

        if (hash && hash !== expectedHashBase64) {
            console.error('Hash mismatch! Expected:', expectedHashBase64, 'Got:', hash)
            // Güvenlik nedeniyle devam etme ama PayTR'a OK dön
            return new Response('OK', { status: 200 })
        }

        // Siparişi bul
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', merchant_oid)
            .single()

        if (orderError || !order) {
            console.error('Order not found:', merchant_oid, orderError)
            return new Response('OK', { status: 200 })
        }

        // Sipariş durumunu belirle
        let newStatus = 'pending'
        let paymentStatus = 'pending'

        if (status === 'success') {
            newStatus = 'confirmed'
            paymentStatus = 'paid'
            
            // Başarılı ödeme - kullanıcıya puan ver
            if (order.user_id) {
                const orderTotal = parseFloat(total_amount || order.total_amount || '0')
                const pointsToAward = Math.floor(orderTotal / 10) // Her 10 TL'ye 1 puan

                try {
                    // award-points edge function'ını çağır
                    const { data: pointsData, error: pointsError } = await supabase.functions.invoke('award-points', {
                        body: { 
                            user_id: order.user_id, 
                            points: pointsToAward,
                            action_type: 'purchase',
                            description: `Sipariş #${merchant_oid} - ${orderTotal} TL`,
                            order_total: orderTotal
                        }
                    })

                    if (pointsError) {
                        console.error('Points award failed:', pointsError)
                    } else {
                        console.log('Points awarded:', pointsToAward, pointsData)
                    }
                } catch (e) {
                    console.error('Points award exception:', e)
                }
            }
        } else {
            newStatus = 'cancelled'
            paymentStatus = 'failed'
        }

        // Veritabanını güncelle
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                payment_status: paymentStatus,
                payment_response: JSON.stringify({
                    status,
                    failed_reason_code,
                    failed_reason_msg,
                    callback_time: new Date().toISOString()
                }),
                updated_at: new Date().toISOString()
            })
            .eq('id', order.id)

        if (updateError) {
            console.error('Order update failed:', updateError)
        } else {
            console.log('Order updated successfully:', merchant_oid, newStatus, paymentStatus)
        }

        // PayTR'a OK dönmeliyiz (bu çok önemli!)
        return new Response('OK', { 
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        })

    } catch (error: any) {
        console.error('Callback error:', error)
        // Hata olsa bile PayTR'a OK dönmeliyiz (yoksa tekrar dener)
        return new Response('OK', { 
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        })
    }
})

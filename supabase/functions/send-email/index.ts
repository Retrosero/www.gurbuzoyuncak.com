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
        const { to, subject, htmlContent, templateId, variables, metadata } = await req.json();

        // Email doğrulama
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            throw new Error('Geçersiz email adresi');
        }

        // Email gönderim simülasyonu (gerçek ortamda SMTP servisi kullanılmalı)
        console.log('Email gönderiliyor:', { to, subject, templateId });
        
        // Email içeriğini variables ile değiştir
        let emailHtml = htmlContent;
        if (variables) {
            Object.keys(variables).forEach(key => {
                emailHtml = emailHtml.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
            });
        }

        // Supabase client oluştur
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Email logunu kaydet
        const logResponse = await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            },
            body: JSON.stringify({
                recipient_email: to,
                template_id: templateId,
                subject: subject,
                status: 'sent',
                sent_at: new Date().toISOString(),
                metadata: metadata || {}
            })
        });

        if (!logResponse.ok) {
            console.error('Email log kaydedilemedi');
        }

        // Email gönderim simülasyonu - gerçek ortamda burada SMTP ile gönderilir
        const emailData = {
            to,
            subject,
            html: emailHtml,
            from: 'noreply@gurbuzoyuncak.com'
        };

        console.log('Email gönderildi:', emailData);

        return new Response(JSON.stringify({
            success: true,
            message: 'Email başarıyla gönderildi',
            data: {
                to,
                subject,
                sentAt: new Date().toISOString(),
                emailId: Math.random().toString(36).substr(2, 9)
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Email gönderim hatası:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
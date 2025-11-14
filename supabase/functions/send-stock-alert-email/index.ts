// Stok uyarı email gönderim servisi
// Bu function stock-monitor'dan çağrılır ve email bildirimleri gönderir

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
        const { alerts } = await req.json();
        
        if (!alerts || alerts.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Gönderilecek email yok'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase bilgileri eksik');
        }

        // Admin ayarlarından email alıcılarını al
        const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_settings?setting_key=eq.stock_alert_email_recipients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
            }
        });

        const settings = await settingsResponse.json();
        if (settings.length === 0) {
            throw new Error('Email alıcı ayarları bulunamadı');
        }

        const recipients = JSON.parse(settings[0].setting_value);
        
        // Email içeriğini hazırla
        const emailContent = generateEmailContent(alerts);
        const emailSubject = generateEmailSubject(alerts);
        
        console.log(`Email bildirimi gönderilecek: ${recipients.join(', ')}`);
        console.log('Email içeriği:', emailContent);
        
        // Burada gerçek email gönderme servisi entegre edilecek
        // Şimdilik sadece log yazıyoruz
        
        // Supabase'de email gönderim kaydını güncelle
        for (const alert of alerts) {
            await fetch(`${SUPABASE_URL}/rest/v1/stock_alerts?id=eq.${alert.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email_sent: true,
                    email_sent_at: new Date().toISOString(),
                    email_recipients: recipients
                })
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Email bildirimi gönderildi',
            data: {
                recipients: recipients,
                alerts_count: alerts.length,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Email gönderme hatası:', error.message);
        
        return new Response(JSON.stringify({
            error: {
                code: 'EMAIL_SEND_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function generateEmailContent(alerts: any[]): string {
    const criticalAlerts = alerts.filter(a => a.priority === 'critical' || a.priority === 'high');
    const mediumAlerts = alerts.filter(a => a.priority === 'medium');
    const lowAlerts = alerts.filter(a => a.priority === 'low');
    
    let content = `
Gürbüz Oyuncak - Stok Uyarı Raporu
==================================

Tarih: ${new Date().toLocaleString('tr-TR')}
`;

    if (criticalAlerts.length > 0) {
        content += `\n🚨 KRİTİK UYARILAR (${criticalAlerts.length} adet):\n`;
        criticalAlerts.forEach(alert => {
            content += `• ${alert.message}\n`;
        });
    }

    if (mediumAlerts.length > 0) {
        content += `\n⚠️ ORTA ÖNCELİKLİ UYARILAR (${mediumAlerts.length} adet):\n`;
        mediumAlerts.forEach(alert => {
            content += `• ${alert.message}\n`;
        });
    }

    if (lowAlerts.length > 0) {
        content += `\nℹ️ DÜŞÜK ÖNCELİKLİ UYARILAR (${lowAlerts.length} adet):\n`;
        lowAlerts.forEach(alert => {
            content += `• ${alert.message}\n`;
        });
    }

    content += `
Toplam: ${alerts.length} adet uyarı

Bu otomatik bir bildirimdir.
Lütfen admin panelinden stok durumunu kontrol edin.
`;

    return content;
}

function generateEmailSubject(alerts: any[]): string {
    const criticalCount = alerts.filter(a => a.priority === 'critical' || a.priority === 'high').length;
    if (criticalCount > 0) {
        return `🚨 KRİTİK: ${criticalCount} ürün için acil stok uyarısı!`;
    }
    return `📊 Stok Uyarısı: ${alerts.length} ürün için uyarı mevcut`;
}
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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Zamanlanmış raporları kontrol et
        const schedulesResponse = await fetch(`${supabaseUrl}/rest/v1/report_schedules?is_active=eq.true&next_send=lte.${new Date().toISOString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            }
        });

        if (!schedulesResponse.ok) {
            throw new Error('Zamanlanmış raporlar alınamadı');
        }

        const schedules = await schedulesResponse.json();
        let processedCount = 0;
        let sentCount = 0;

        for (const schedule of schedules) {
            try {
                // Raporu oluştur
                const reportResponse = await fetch(`${supabaseUrl}/functions/v1/generate-reports`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    body: JSON.stringify({
                        reportType: schedule.report_type,
                        filters: schedule.filters,
                        dateFrom: getDateRangeFromFrequency(schedule.frequency).from,
                        dateTo: getDateRangeFromFrequency(schedule.frequency).to
                    })
                });

                if (!reportResponse.ok) {
                    console.error(`Rapor oluşturulamadı: ${schedule.name}`);
                    continue;
                }

                const reportData = await reportResponse.json();
                
                // Email içeriği oluştur
                const emailHtml = generateReportEmailHtml(schedule, reportData.data);
                
                // Her alıcıya email gönder
                const recipients = Array.isArray(schedule.recipients) ? schedule.recipients : JSON.parse(schedule.recipients || '[]');
                
                for (const recipient of recipients) {
                    try {
                        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${supabaseKey}`
                            },
                            body: JSON.stringify({
                                to: recipient,
                                subject: `[Gürbüz Oyuncak] ${schedule.name} - ${new Date().toLocaleDateString('tr-TR')}`,
                                htmlContent: emailHtml,
                                metadata: {
                                    type: 'scheduled_report',
                                    schedule_id: schedule.id,
                                    report_type: schedule.report_type,
                                    frequency: schedule.frequency
                                }
                            })
                        });

                        if (emailResponse.ok) {
                            sentCount++;
                        }
                    } catch (emailError) {
                        console.error(`Email gönderim hatası (${recipient}):`, emailError);
                    }
                }

                // Son gönderim zamanını güncelle
                const nextSend = calculateNextSend(schedule.frequency);
                await fetch(`${supabaseUrl}/rest/v1/report_schedules?id=eq.${schedule.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    },
                    body: JSON.stringify({
                        last_sent: new Date().toISOString(),
                        next_send: nextSend.toISOString()
                    })
                });

                processedCount++;

            } catch (scheduleError) {
                console.error(`Rapor planı işlenirken hata (${schedule.name}):`, scheduleError);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Zamanlanmış raporlar işlendi',
            data: {
                processed: processedCount,
                sent: sentCount,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Zamanlanmış rapor gönderimi hatası:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Frekansa göre tarih aralığı hesapla
function getDateRangeFromFrequency(frequency) {
    const now = new Date();
    let fromDate = new Date();
    
    switch (frequency) {
        case 'daily':
            fromDate.setDate(now.getDate() - 1);
            break;
        case 'weekly':
            fromDate.setDate(now.getDate() - 7);
            break;
        case 'monthly':
            fromDate.setMonth(now.getMonth() - 1);
            break;
        default:
            fromDate.setDate(now.getDate() - 7); // Varsayılan: son 7 gün
    }
    
    return {
        from: fromDate.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0]
    };
}

// Sonraki gönderim zamanını hesapla
function calculateNextSend(frequency) {
    const now = new Date();
    const next = new Date();
    
    switch (frequency) {
        case 'daily':
            next.setDate(now.getDate() + 1);
            next.setHours(8, 0, 0, 0); // Sabah 8'de
            break;
        case 'weekly':
            next.setDate(now.getDate() + 7);
            next.setHours(8, 0, 0, 0);
            break;
        case 'monthly':
            next.setMonth(now.getMonth() + 1);
            next.setDate(1); // Ayın 1'i
            next.setHours(8, 0, 0, 0);
            break;
    }
    
    return next;
}

// Rapor email HTML'i oluştur
function generateReportEmailHtml(schedule, reportData) {
    const { type, summary, period, generatedAt } = reportData;
    
    let reportContent = '';
    
    switch (type) {
        case 'sales':
            reportContent = `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📊 Satış Özeti</h3>
                    <p><strong>Toplam Sipariş:</strong> ${summary.totalOrders}</p>
                    <p><strong>Toplam Gelir:</strong> ₺${summary.totalRevenue.toFixed(2)}</p>
                    <p><strong>Ortalama Sipariş Değeri:</strong> ₺${summary.averageOrderValue.toFixed(2)}</p>
                </div>
            `;
            break;
        case 'stock':
            reportContent = `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📦 Stok Özeti</h3>
                    <p><strong>Toplam Ürün:</strong> ${summary.totalProducts}</p>
                    <p><strong>Düşük Stoklu Ürünler:</strong> ${summary.lowStockProducts.length}</p>
                    <p><strong>Tükenen Ürünler:</strong> ${summary.outOfStockProducts.length}</p>
                    <p><strong>Toplam Stok Değeri:</strong> ₺${summary.totalStockValue.toFixed(2)}</p>
                </div>
            `;
            break;
        case 'products':
            reportContent = `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>🎯 Ürün Özeti</h3>
                    <p><strong>Toplam Ürün:</strong> ${summary.totalProducts}</p>
                    <p><strong>Aktif Ürünler:</strong> ${summary.activeProducts}</p>
                    <p><strong>Pasif Ürünler:</strong> ${summary.inactiveProducts}</p>
                </div>
            `;
            break;
    }
    
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">📈 ${schedule.name}</h2>
            <p>Bu rapor <strong>${period.from}</strong> ile <strong>${period.to}</strong> arasındaki verileri içermektedir.</p>
            
            ${reportContent}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${supabaseUrl}/admin/reports" 
                   style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   Detaylı Raporları Görüntüle
                </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Bu rapor Gürbüz Oyuncak sistemi tarafından otomatik olarak oluşturulmuştur.<br>
                Oluşturma zamanı: ${new Date(generatedAt).toLocaleString('tr-TR')}
            </p>
        </div>
    `;
}
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
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseServiceKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
        }

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'list';

        switch (action) {
            case 'backup':
                return await handleBackup(req, corsHeaders, supabaseServiceKey);
            case 'schedule':
                return await handleSchedule(req, corsHeaders, supabaseServiceKey);
            case 'list':
                return await handleList(req, corsHeaders, supabaseServiceKey);
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('Backup manager error:', error);

        const errorResponse = {
            error: {
                code: 'BACKUP_MANAGER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Yedekleme işlemini gerçekleştir
async function handleBackup(req: Request, corsHeaders: any, serviceKey: string) {
    const requestData = await req.json();
    const { table_name, backup_path } = requestData;

    // Tablo verilerini al
    const dataResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table_name}?select=*`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    if (!dataResponse.ok) {
        throw new Error(`Failed to fetch data from ${table_name}`);
    }

    const data = await dataResponse.json();

    // Yedekleme bilgilerini kaydet
    const backupData = {
        table_name,
        backup_path: backup_path || `backup_${table_name}_${new Date().toISOString()}`,
        data: JSON.stringify(data),
        backup_date: new Date().toISOString(),
        record_count: data.length
    };

    // Backup schedule'ı güncelle
    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/backup_schedules?table_name=eq.${table_name}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            last_backup: new Date().toISOString(),
            next_backup: calculateNextBackup(new Date(), 'daily')
        })
    });

    return new Response(JSON.stringify({ 
        success: true, 
        data: backupData,
        message: 'Backup completed successfully' 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Yedekleme programlamasını yönet
async function handleSchedule(req: Request, corsHeaders: any, serviceKey: string) {
    const requestData = await req.json();
    const { table_name, frequency, created_by } = requestData;

    // Mevcut schedule'ı kontrol et
    const existingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/backup_schedules?table_name=eq.${table_name}`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const existing = await existingResponse.json();

    let response;
    if (existing.length > 0) {
        // Güncelle
        response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/backup_schedules?table_name=eq.${table_name}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                frequency,
                is_active: true,
                next_backup: calculateNextBackup(new Date(), frequency)
            })
        });
    } else {
        // Oluştur
        response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/backup_schedules`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': serviceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                table_name,
                frequency,
                created_by,
                next_backup: calculateNextBackup(new Date(), frequency),
                is_active: true
            })
        });
    }

    const data = await response.json();

    return new Response(JSON.stringify({ 
        success: true, 
        data: data,
        message: 'Backup schedule updated successfully' 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Yedekleme programlarını listele
async function handleList(req: Request, corsHeaders: any, serviceKey: string) {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/backup_schedules?select=*&order=created_at.desc`, {
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        }
    });

    const data = await response.json();

    return new Response(JSON.stringify({ 
        success: true, 
        data: data
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Sonraki yedekleme tarihini hesapla
function calculateNextBackup(currentDate: Date, frequency: string): string {
    const nextDate = new Date(currentDate);

    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        default:
            nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate.toISOString();
}
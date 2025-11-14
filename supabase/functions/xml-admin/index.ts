Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Kullanıcı doğrulama
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Yetkilendirme gerekli');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Geçersiz token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Kullanıcının admin olup olmadığını kontrol et
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=role`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Profil bilgisi alınamadı');
        }

        const profiles = await profileResponse.json();
        if (profiles.length === 0 || profiles[0].role !== 'admin') {
            throw new Error('Bu işlem için admin yetkisi gerekli');
        }

        const url = new URL(req.url);
        const method = req.method;

        // GET: Tüm task'ları listele
        if (method === 'GET') {
            return await getTasks(supabaseUrl, serviceRoleKey, corsHeaders);
        }

        // POST: Yeni task oluştur
        if (method === 'POST') {
            const requestData = await req.json();
            return await createTask(requestData, supabaseUrl, serviceRoleKey, corsHeaders);
        }

        // PATCH: Task güncelle
        if (method === 'PATCH') {
            const requestData = await req.json();
            const taskId = url.searchParams.get('id');
            
            if (!taskId) {
                throw new Error('Task ID gerekli');
            }
            
            return await updateTask(parseInt(taskId), requestData, supabaseUrl, serviceRoleKey, corsHeaders);
        }

        // DELETE: Task sil
        if (method === 'DELETE') {
            const taskId = url.searchParams.get('id');
            
            if (!taskId) {
                throw new Error('Task ID gerekli');
            }
            
            return await deleteTask(parseInt(taskId), supabaseUrl, serviceRoleKey, corsHeaders);
        }

        throw new Error('Desteklenmeyen HTTP metodu');

    } catch (error) {
        console.error('XML admin error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'XML_ADMIN_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Tüm task'ları listele
async function getTasks(supabaseUrl: string, serviceRoleKey: string, corsHeaders: any) {
    const response = await fetch(`${supabaseUrl}/rest/v1/xml_scheduled_tasks?order=created_at.desc`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Task\'lar alınamadı');
    }

    const tasks = await response.json();

    // Her task için son çalışma geçmişini de al
    for (const task of tasks) {
        const historyResponse = await fetch(
            `${supabaseUrl}/rest/v1/xml_pull_history?task_id=eq.${task.id}&order=run_at.desc&limit=5`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (historyResponse.ok) {
            task.recent_history = await historyResponse.json();
        } else {
            task.recent_history = [];
        }
    }

    return new Response(JSON.stringify({ data: tasks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Yeni task oluştur
async function createTask(taskData: any, supabaseUrl: string, serviceRoleKey: string, corsHeaders: any) {
    const { name, xml_url, schedule_cron, is_active } = taskData;

    if (!name || !xml_url) {
        throw new Error('İsim ve XML URL gerekli');
    }

    // Cron formatını doğrula
    if (schedule_cron && !/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-9])|\*\/([0-9]|1[0-9]|2[0-9])) (\*|([0-9]|1[0-9]|2[0-9]|3[0-9])|\*\/([0-9]|1[0-9]|2[0-9])) (\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9])) (\*|([0-9]|1[0-9]|2[0-9])|\*\/([0-9]|1[0-9]|2[0-9]))$/.test(schedule_cron)) {
        throw new Error('Geçersiz cron formatı');
    }

    const nextRun = calculateNextRun(schedule_cron || '0 2 * * *');

    const response = await fetch(`${supabaseUrl}/rest/v1/xml_scheduled_tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            name,
            xml_url,
            schedule_cron: schedule_cron || '0 2 * * *',
            is_active: is_active !== undefined ? is_active : true,
            next_run: nextRun
        })
    });

    if (!response.ok) {
        throw new Error('Task oluşturulamadı');
    }

    const newTask = await response.json();

    return new Response(JSON.stringify({ data: newTask[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Task güncelle
async function updateTask(taskId: number, updateData: any, supabaseUrl: string, serviceRoleKey: string, corsHeaders: any) {
    const { name, xml_url, schedule_cron, is_active, max_retries } = updateData;

    const updateFields: any = {};
    
    if (name !== undefined) updateFields.name = name;
    if (xml_url !== undefined) updateFields.xml_url = xml_url;
    if (schedule_cron !== undefined) updateFields.schedule_cron = schedule_cron;
    if (is_active !== undefined) updateFields.is_active = is_active;
    if (max_retries !== undefined) updateFields.max_retries = max_retries;

    // Eğer cron değiştiyse, bir sonraki çalışma zamanını hesapla
    if (schedule_cron !== undefined) {
        updateFields.next_run = calculateNextRun(schedule_cron);
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/xml_scheduled_tasks?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateFields)
    });

    if (!response.ok) {
        throw new Error('Task güncellenemedi');
    }

    const updatedTask = await response.json();

    return new Response(JSON.stringify({ data: updatedTask[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Task sil
async function deleteTask(taskId: number, supabaseUrl: string, serviceRoleKey: string, corsHeaders: any) {
    const response = await fetch(`${supabaseUrl}/rest/v1/xml_scheduled_tasks?id=eq.${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Task silinemedi');
    }

    return new Response(JSON.stringify({ 
        data: { message: 'Task başarıyla silindi' } 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Bir sonraki çalışma zamanını hesapla
function calculateNextRun(cronExpression: string): string {
    const now = new Date();
    
    switch (cronExpression) {
        case '0 2 * * *': // Her gün 02:00
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0);
            return tomorrow.toISOString();
            
        case '0 9 * * *': // Her gün 09:00
            const tomorrow9 = new Date(now);
            tomorrow9.setDate(tomorrow9.getDate() + 1);
            tomorrow9.setHours(9, 0, 0, 0);
            return tomorrow9.toISOString();
            
        case '0 2 * * 1': // Her hafta pazartesi 02:00
            const nextMonday = new Date(now);
            nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7);
            nextMonday.setHours(2, 0, 0, 0);
            return nextMonday.toISOString();
            
        default:
            // Varsayılan olarak yarın aynı saat
            const nextDay = new Date(now);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay.toISOString();
    }
}
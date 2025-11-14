// Favori Ürün Stok Takibi ve Bildirim Sistemi
// Bu fonksiyon favori ürünlerin stok değişikliklerini takip eder ve bildirim gönderir

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

interface FavoriteProduct {
  id: number
  product_id: number
  user_id: string
  notified_stock_change: boolean
}

interface ProductStock {
  product_id: number
  new_stock: number
  old_stock?: number
}

interface StockChange {
  product_id: number
  old_stock: number
  new_stock: number
  alert_type: 'restocked' | 'low_stock' | 'out_of_stock'
  message: string
}

serve(async (req) => {
  // CORS preflight isteği kontrolü
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1. Tüm favori ürünleri çek (stok değişimi bildirimi gönderilmemiş olanlar)
    const favoritesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_favorites?notified_stock_change=eq.false&select=id,product_id,user_id,notified_stock_change`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!favoritesResponse.ok) {
      throw new Error('Favoriler alınamadı')
    }

    const favorites: FavoriteProduct[] = await favoritesResponse.json()

    if (favorites.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Takip edilecek favori ürün bulunamadı',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Bu ürünlerin mevcut stok bilgilerini çek
    const productIds = favorites.map(f => f.product_id)
    const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,stock&id=in.(${productIds.join(',')})`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!productsResponse.ok) {
      throw new Error('Ürün stok bilgileri alınamadı')
    }

    const currentProducts = await productsResponse.json()
    const currentStocks = new Map(currentProducts.map((p: any) => [p.id, p.stock]))

    // 3. Her favori için stok değişikliğini kontrol et
    const stockChanges: StockChange[] = []
    
    for (const favorite of favorites) {
      const currentStock = currentStocks.get(favorite.product_id)
      
      if (currentStock === undefined) continue

      // Son stok geçmişini al
      const historyResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/favorite_stock_alerts?favorite_id=eq.${favorite.id}&order=created_at.desc&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          }
        }
      )

      let previousStock = currentStock
      
      if (historyResponse.ok) {
        const history = await historyResponse.json()
        if (history.length > 0) {
          previousStock = history[0].current_stock
        }
      }

      // Stok değişikliği var mı?
      if (currentStock !== previousStock) {
        const alertType = determineStockAlertType(previousStock, currentStock)
        const message = generateStockMessage(alertType, previousStock, currentStock)

        stockChanges.push({
          product_id: favorite.product_id,
          old_stock: previousStock,
          new_stock: currentStock,
          alert_type: alertType,
          message: message
        })

        // Stok bildirimini kaydet
        await fetch(`${SUPABASE_URL}/rest/v1/favorite_stock_alerts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            favorite_id: favorite.id,
            product_id: favorite.product_id,
            previous_stock: previousStock,
            current_stock: currentStock,
            alert_type: alertType,
            message: message
          })
        })
      }
    }

    // 4. Bildirim gönderilecek stok değişiklikleri
    const notifications = []

    for (const change of stockChanges) {
      // Bu stok değişikliği için favori kayıtlarını bul
      const affectedFavorites = favorites.filter(f => f.product_id === change.product_id)

      for (const favorite of affectedFavorites) {
        // Kullanıcı bilgilerini al
        const userResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${favorite.user_id}&select=user_id,full_name,email`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!userResponse.ok) continue

        const users = await userResponse.json()
        const user = users[0]

        if (!user || !user.email) continue

        // Ürün bilgilerini al
        const productResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=name&id=eq.${change.product_id}`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Content-Type': 'application/json'
            }
          }
        )

        const products = await productResponse.json()
        const product = products[0]

        if (!product) continue

        // Email bildirimi gönder (sadece pozitif değişiklikler için)
        if (change.alert_type === 'restocked' || change.alert_type === 'low_stock') {
          const emailData = {
            to: user.email,
            subject: change.alert_type === 'restocked' 
              ? `🎉 ${product.name} stokta!
`
              : `⚠️ ${product.name} az kaldı!`,
            html: generateStockChangeEmail(user, product, change)
          }

          const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
          })

          if (emailResponse.ok) {
            // Bildirim gönderildi olarak işaretle
            await fetch(`${SUPABASE_URL}/rest/v1/user_favorites?id=eq.${favorite.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                notified_stock_change: true,
                stock_change_notified_at: new Date().toISOString()
              })
            })

            // Stok bildiriminde bildirim gönderildi olarak işaretle
            await fetch(
              `${SUPABASE_URL}/rest/v1/favorite_stock_alerts?favorite_id=eq.${favorite.id}&order=created_at.desc&limit=1`,
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  notified: true,
                  email_sent_at: new Date().toISOString()
                })
              }
            )

            notifications.push({
              user_id: favorite.user_id,
              product_id: change.product_id,
              alert_type: change.alert_type,
              email_sent: true
            })
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Stok takibi tamamlandı',
      processed_favorites: favorites.length,
      stock_changes_found: stockChanges.length,
      notifications_sent: notifications.length,
      details: {
        stock_changes: stockChanges,
        notifications: notifications
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Stok takip hatası:', error)
    
    return new Response(JSON.stringify({
      error: {
        code: 'STOCK_TRACKING_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function determineStockAlertType(oldStock: number, newStock: number): 'restocked' | 'low_stock' | 'out_of_stock' {
  if (oldStock === 0 && newStock > 0) {
    return 'restocked'
  } else if (newStock === 0) {
    return 'out_of_stock'
  } else if (newStock <= 5 && oldStock > 5) {
    return 'low_stock'
  }
  
  // Eğer önceki durum belirsizse, mevcut stoka göre karar ver
  if (newStock === 0) {
    return 'out_of_stock'
  } else if (newStock <= 5) {
    return 'low_stock'
  }
  
  // Diğer durumlar için restocked olarak işaretle (artış var demek)
  return 'restocked'
}

function generateStockMessage(alertType: string, oldStock: number, newStock: number): string {
  switch (alertType) {
    case 'restocked':
      return `Ürün tekrar stokta! Önceki stok: ${oldStock}, Mevcut stok: ${newStock}`
    case 'low_stock':
      return `Ürün az kaldı! Mevcut stok: ${newStock}`
    case 'out_of_stock':
      return `Ürün stokta bitti! Mevcut stok: ${newStock}`
    default:
      return `Stok değişikliği: ${oldStock} → ${newStock}`
  }
}

function generateStockChangeEmail(user: any, product: any, change: StockChange): string {
  const alertConfig = {
    'restocked': {
      icon: '🎉',
      title: 'Ürün Tekrar Stokta!',
      color: '#10B981',
      bgColor: '#F0FDF4',
      description: 'Takip ettiğiniz ürün tekrar stokta!',
      actionText: 'Hemen satın alın!'
    },
    'low_stock': {
      icon: '⚠️',
      title: 'Ürün Az Kaldı!',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      description: 'Ürününüz az kaldı, son fırsat!',
      actionText: 'Son fırsatı kaçırmayın!'
    },
    'out_of_stock': {
      icon: '❌',
      title: 'Ürün Stokta Bitti!',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      description: 'Üzgünüz, ürün şu anda stokta yok.',
      actionText: 'Stok gelince bildirim alın!'
    }
  }

  const config = alertConfig[change.alert_type as keyof typeof alertConfig]

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stok Değişikliği Bildirimi</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${config.icon} ${config.title}</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Merhaba <strong>${user.full_name || 'Değerli Müşterimiz'}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
        ${config.description}
      </p>
      
      <div style="background: ${config.bgColor}; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${config.color};">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${product.name}</h3>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Stok Durumu:</span>
          <span style="color: ${config.color}; font-size: 16px; font-weight: bold;">
            ${change.newStock > 0 ? `${change.newStock} adet` : 'Stokta yok'}
          </span>
        </div>
        
        ${change.old_stock !== change.new_stock ? `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #666;">Önceki Stok:</span>
          <span style="color: #999; font-size: 14px;">
            ${change.old_stock > 0 ? `${change.old_stock} adet` : 'Stokta yok'}
          </span>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://gurbuzoyuncak.com/urun/${product.id}" 
           style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Ürünü Görüntüle
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          Bu email otomatik olarak gönderilmiştir. Favoriler listenizi yönetmek için 
          <a href="https://gurbuzoyuncak.com/favoriler" style="color: ${config.color};">favoriler sayfanızı</a> ziyaret edebilirsiniz.
        </p>
      </div>
      
    </div>
    
  </body>
  </html>
  `
}
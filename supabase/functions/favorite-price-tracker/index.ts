// Favori Ürün Fiyat Takibi ve Bildirim Sistemi
// Bu fonksiyon favori ürünlerin fiyat değişikliklerini takip eder ve bildirim gönderir

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
  notified_price_change: boolean
}

interface ProductPrice {
  product_id: number
  new_price: number
  old_price?: number
}

interface PriceChange {
  product_id: number
  old_price: number
  new_price: number
  change_type: 'increase' | 'decrease'
  change_percentage: number
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

    // 1. Tüm favori ürünleri çek (fiyat değişimi bildirimi gönderilmemiş olanlar)
    const favoritesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_favorites?notified_price_change=eq.false&select=id,product_id,user_id,notified_price_change`, {
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

    // 2. Bu ürünlerin mevcut fiyatlarını çek
    const productIds = favorites.map(f => f.product_id)
    const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,base_price&id=in.(${productIds.join(',')})`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!productsResponse.ok) {
      throw new Error('Ürün fiyatları alınamadı')
    }

    const currentProducts = await productsResponse.json()
    const currentPrices = new Map(currentProducts.map((p: any) => [p.id, p.base_price]))

    // 3. Her favori için fiyat değişikliğini kontrol et
    const priceChanges: PriceChange[] = []
    
    for (const favorite of favorites) {
      const currentPrice = currentPrices.get(favorite.product_id)
      
      if (!currentPrice) continue

      // Son fiyat geçmişini al
      const historyResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/favorite_price_history?favorite_id=eq.${favorite.id}&order=created_at.desc&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          }
        }
      )

      let previousPrice = currentPrice
      
      if (historyResponse.ok) {
        const history = await historyResponse.json()
        if (history.length > 0) {
          previousPrice = history[0].new_price
        }
      }

      // Fiyat değişikliği var mı?
      if (Math.abs(currentPrice - previousPrice) > 0.01) { // 1 kuruş tolerance
        const changeType: 'increase' | 'decrease' = currentPrice > previousPrice ? 'increase' : 'decrease'
        const changePercentage = Math.abs(((currentPrice - previousPrice) / previousPrice) * 100)

        priceChanges.push({
          product_id: favorite.product_id,
          old_price: previousPrice,
          new_price: currentPrice,
          change_type: changeType,
          change_percentage: changePercentage
        })

        // Fiyat geçmişini kaydet
        await fetch(`${SUPABASE_URL}/rest/v1/favorite_price_history`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            favorite_id: favorite.id,
            product_id: favorite.product_id,
            old_price: previousPrice,
            new_price: currentPrice,
            change_type: changeType,
            change_percentage: changePercentage
          })
        })
      }
    }

    // 4. Bildirim gönderilecek fiyat değişiklikleri
    const notifications = []

    for (const change of priceChanges) {
      // Bu fiyat değişikliği için favori kayıtlarını bul
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

        // Email bildirimi gönder
        const emailData = {
          to: user.email,
          subject: change.change_type === 'decrease' 
            ? `🎉 ${product.name} fiyatı düştü!`
            : `📈 ${product.name} fiyatı arttı`,
          html: generatePriceChangeEmail(user, product, change)
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
              notified_price_change: true,
              price_change_notified_at: new Date().toISOString()
            })
          })

          // Fiyat geçmişinde bildirim gönderildi olarak işaretle
          await fetch(
            `${SUPABASE_URL}/rest/v1/favorite_price_history?favorite_id=eq.${favorite.id}&order=created_at.desc&limit=1`,
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
            change_type: change.change_type,
            email_sent: true
          })
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Fiyat takibi tamamlandı',
      processed_favorites: favorites.length,
      price_changes_found: priceChanges.length,
      notifications_sent: notifications.length,
      details: {
        price_changes: priceChanges,
        notifications: notifications
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Fiyat takip hatası:', error)
    
    return new Response(JSON.stringify({
      error: {
        code: 'PRICE_TRACKING_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generatePriceChangeEmail(user: any, product: any, change: PriceChange): string {
  const changeIcon = change.change_type === 'decrease' ? '📉' : '📈'
  const changeColor = change.change_type === 'decrease' ? '#10B981' : '#EF4444'
  const actionText = change.change_type === 'decrease' ? 'Hemen satın alın!' : 'Fiyat artışından haberdar oldunuz'

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fiyat Değişikliği Bildirimi</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${changeIcon} Favori Ürününüzün Fiyatı Değişti!</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Merhaba <strong>${user.full_name || 'Değerli Müşterimiz'}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
        Takip ettiğiniz favori ürününüzde fiyat değişikliği oldu. Detaylar aşağıdadır:
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${product.name}</h3>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Eski Fiyat:</span>
          <span style="text-decoration: line-through; color: #999; font-size: 16px;">₺${change.old_price.toFixed(2)}</span>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Yeni Fiyat:</span>
          <span style="color: ${changeColor}; font-size: 20px; font-weight: bold;">₺${change.new_price.toFixed(2)}</span>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #666;">Değişiklik:</span>
          <span style="color: ${changeColor}; font-size: 16px; font-weight: bold;">
            ${changeIcon} %${change.change_percentage.toFixed(1)}
          </span>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://gurbuzoyuncak.com/urun/${product.id}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Ürünü Görüntüle
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          Bu email otomatik olarak gönderilmiştir. Favoriler listenizi yönetmek için 
          <a href="https://gurbuzoyuncak.com/favoriler" style="color: #667eea;">favoriler sayfanızı</a> ziyaret edebilirsiniz.
        </p>
      </div>
      
    </div>
    
  </body>
  </html>
  `
}
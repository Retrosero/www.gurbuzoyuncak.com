# Özel Durum Renkleri Dokümantasyonu

Bu dokümantasyon, Badge, Tag, Pill ve Notification component'lerindeki özel durum renklerinin nasıl kullanılacağını açıklamaktadır.

## Renk Paleti

### 🎯 Kategori Renkleri
- **Ana Renk**: Turkuaz (`#40E0D0`)
- **Hover**: Koyu Turkuaz (`#30D0C0`)
- **Kullanım**: Ürün kategorileri, filtre badge'leri

### 🎉 Promosyon Renkleri  
- **Ana Renk**: Pembe (`#FF69B4`)
- **Hover**: Koyu Pembe (`#FF1493`)
- **Kullanım**: Kampanyalar, indirimler, promosyonlar

### ⭐ Yeni Ürün Renkleri
- **Ana Renk**: Sarı (`#ffde59`)
- **Hover**: Koyu Sarı (`#ffd700`)
- **Kullanım**: Yeni eklenen ürünler, yenilik etiketleri

### 🔔 Notification Renkleri
- **Başarılı**: Turkuaz (`#4ECDC4`)
- **Uyarı**: Açık Sarı (`#FFE66D`) - siyah metin
- **Hata**: Kırmızımsı Pembe (`#FF6B6B`)
- **Bilgi**: Açık Mavi (`#74B9FF`)

## Component Kullanımları

### Badge Component

```tsx
import { Badge } from '@/components/ui'

// Kategori Badge
<Badge variant="category">Kategoriler</Badge>

// Promosyon Badge
<Badge variant="promotion">%50 İndirim</Badge>

// Yeni Ürün Badge
<Badge variant="newproduct">YENİ</Badge>

// Notification Badge'leri
<Badge variant="notification_success">Başarılı</Badge>
<Badge variant="notification_warning">Uyarı</Badge>
<Badge variant="notification_info">Bilgi</Badge>
```

### Tag Component

```tsx
import { Tag } from '@/components/ui'

// Farklı boyutlarda kullanım
<Tag variant="category" size="sm">Küçük Kategori</Tag>
<Tag variant="promotion" size="default">Normal Promosyon</Tag>
<Tag variant="newproduct" size="lg">Büyük Yeni Ürün</Tag>

// Diğer tag tipleri
<Tag variant="success">Onaylı</Tag>
<Tag variant="warning">Dikkat</Tag>
<Tag variant="error">Hata</Tag>
<Tag variant="info">Bilgi</Tag>
```

### Pill Component

```tsx
import { Pill } from '@/components/ui'

// Badge benzeri ama daha yuvarlak
<Pill variant="category">Kategoriler</Pill>
<Pill variant="promotion">Özel Fırsat</Pill>
<Pill variant="newproduct">Yeni Çıkan</Pill>

// Boyut seçenekleri
<Pill variant="category" size="sm">Küçük</Pill>
<Pill variant="promotion" size="default">Normal</Pill>
<Pill variant="newproduct" size="lg">Büyük</Pill>
```

### Notification Component

```tsx
import { Notification } from '@/components/ui'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

// Basit bildirim
<Notification variant="default">
  Varsayılan bildirim mesajı
</Notification>

// Başlık ve ikonlu bildirim
<Notification 
  variant="success" 
  title="Başarılı" 
  icon={<CheckCircle className="h-5 w-5" />}
>
  İşleminiz başarıyla tamamlandı
</Notification>

// Özel durum bildirimleri
<Notification variant="promotion" title="🎉 Kampanya" icon={<span>🎁</span>}>
  Tüm ürünlerde %20 indirim!
</Notification>

<Notification variant="category" title="📂 Yeni Kategori">
  Oyuncak kategorimize yeni ürünler eklendi!
</Notification>

<Notification variant="newproduct" title="🆕 Yeni Ürün">
  Yeni ürünümüz sizlerle!
</Notification>
```

## Mevcut Sayfalardaki Güncellemeler

### ProductCard.tsx
- Yeni ürün badge'i artık sarı (`#ffde59`) kullanıyor
- Yeşil gradient yerine sarı gradient uygulandı

### CampaignBanner.tsx
- Promosyon banner'ları artık pembe gradient kullanıyor
- CTA butonları pembe tonlarda
- Genel promosyon teması pembe renklere güncellendi

### ActiveFilters.tsx
- Kategori filtreleri artık turkuaz renk kullanıyor
- Mavi yerine turkuaz tonları uygulandı

### AdminNotificationCenter.tsx
- Notification tipleri için yeni renk paleti
- Status badge'leri güncellendi
- Tema tutarlılığı sağlandı

## Tasarım İlkeleri

1. **Tutarlılık**: Aynı türdeki elementler aynı renkleri kullanır
2. **Erişilebilirlik**: Yeterli kontrast oranları sağlandı
3. **Kullanıcı Deneyimi**: Renkler anlamı açık bir şekilde yansıtır
4. **Esneklik**: Farklı boyut ve varyant seçenekleri mevcut

## Öneriler

- Kategori etiketlerinde tutkuaz kullanın
- Promosyon ve kampanyalarda pembe renk tercih edin  
- Yeni ürün vurgularında sarı renk kullanın
- Bildirimlerde uygun severity renklerini seçin
- Tutarlılık için aynı component'i aynı amaç için kullanın
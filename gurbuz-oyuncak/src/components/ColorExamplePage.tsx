import { Tag } from '../ui/tag'
import { Pill } from '../ui/pill'
import { Badge } from '../ui/badge'
import { Notification } from '../ui/notification'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export default function ColorExamplePage() {
  return (
    <div className="p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-6">Özel Durum Renkleri Örnekleri</h1>
        <p className="text-gray-600 mb-8">
          Badge, Tag, Pill ve Notification component'lerinin yeni renkleri ile kullanım örnekleri
        </p>
      </div>

      {/* Badge Örnekleri */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Badge Örnekleri</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="category">Kategoriler</Badge>
            <Badge variant="promotion">Promosyonlar</Badge>
            <Badge variant="newproduct">Yeni Ürünler</Badge>
            <Badge variant="notification">Bildirimler</Badge>
            <Badge variant="notification_success">Başarılı</Badge>
            <Badge variant="notification_warning">Uyarı</Badge>
            <Badge variant="notification_info">Bilgi</Badge>
            <Badge variant="success">Onay</Badge>
          </div>
        </div>
      </section>

      {/* Tag Örnekleri */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tag Örnekleri</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Tag variant="category">Kategoriler</Tag>
            <Tag variant="promotion">Promosyonlar</Tag>
            <Tag variant="newproduct">Yeni Ürünler</Tag>
            <Tag variant="success">Onaylı</Tag>
            <Tag variant="warning">Dikkat</Tag>
            <Tag variant="error">Hata</Tag>
            <Tag variant="info">Bilgi</Tag>
          </div>
          <div className="flex flex-wrap gap-3">
            <Tag variant="category" size="sm">Küçük Kategori</Tag>
            <Tag variant="promotion" size="default">Normal Promosyon</Tag>
            <Tag variant="newproduct" size="lg">Büyük Yeni Ürün</Tag>
          </div>
        </div>
      </section>

      {/* Pill Örnekleri */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Pill Örnekleri</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Pill variant="category">Kategoriler</Pill>
            <Pill variant="promotion">Promosyonlar</Pill>
            <Pill variant="newproduct">Yeni Ürünler</Pill>
            <Pill variant="success">Onaylı</Pill>
            <Pill variant="warning">Dikkat</Pill>
            <Pill variant="error">Hata</Pill>
            <Pill variant="info">Bilgi</Pill>
          </div>
          <div className="flex flex-wrap gap-3">
            <Pill variant="category" size="sm">Küçük</Pill>
            <Pill variant="promotion" size="default">Normal</Pill>
            <Pill variant="newproduct" size="lg">Büyük</Pill>
          </div>
        </div>
      </section>

      {/* Notification Örnekleri */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Notification Örnekleri</h2>
        <div className="space-y-4 max-w-2xl">
          <Notification variant="default">
            <strong>Varsayılan Bildirim:</strong> Bu bir varsayılan bildirim mesajıdır.
          </Notification>

          <Notification variant="success" title="Başarılı" icon={<CheckCircle className="h-5 w-5" />}>
            İşleminiz başarıyla tamamlandı. Tüm verileriniz güvenle kaydedildi.
          </Notification>

          <Notification variant="warning" title="Uyarı" icon={<AlertTriangle className="h-5 w-5" />}>
            Dikkat! Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
          </Notification>

          <Notification variant="error" title="Hata" icon={<AlertCircle className="h-5 w-5" />}>
            Bir hata oluştu! Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.
          </Notification>

          <Notification variant="info" title="Bilgilendirme" icon={<Info className="h-5 w-5" />}>
            Yeni özellikler kullanıma sunuldu. Daha fazla bilgi için güncellemeleri kontrol edin.
          </Notification>

          <Notification variant="promotion" title="🎉 Özel Kampanya" icon={<span className="text-xl">🎁</span>}>
            Tüm ürünlerde %20 indirim! Fırsatı kaçırmayın, sadece bu hafta geçerli.
          </Notification>

          <Notification variant="category" title="📂 Yeni Kategori" icon={<span className="text-xl">🧸</span>}>
            Oyuncak kategorimize yeni ürünler eklendi. En popüler seçimleri inceleyin!
          </Notification>

          <Notification variant="newproduct" title="🆕 Yeni Ürün" icon={<span className="text-xl">✨</span>}>
            Yeni ürünümüz sizlerle! Özel lansman fiyatı ile hemen sipariş verin.
          </Notification>
        </div>
      </section>
    </div>
  )
}
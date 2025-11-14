import { useState } from 'react'
import { ProductSpecification } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Info, Star, Package, Shield } from 'lucide-react'

interface ProductSpecificationsProps {
  specifications: ProductSpecification[]
  productName: string
  warranty?: string
  deliveryInfo?: string
}

export default function ProductSpecifications({
  specifications,
  productName,
  warranty,
  deliveryInfo
}: ProductSpecificationsProps) {
  const [activeTab, setActiveTab] = useState('specs')

  // Spesifikasyonları gruplandır
  const groupedSpecs = specifications.reduce((acc, spec) => {
    const group = spec.spec_group || 'Genel'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(spec)
    return acc
  }, {} as Record<string, ProductSpecification[]>)

  // Her grup için sıralama
  Object.keys(groupedSpecs).forEach(group => {
    groupedSpecs[group].sort((a, b) => a.sort_order - b.sort_order)
  })

  // Öne çıkan özellikler
  const highlightedSpecs = specifications.filter(spec => spec.is_highlighted)

  if (specifications.length === 0 && !warranty && !deliveryInfo) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Özellikler
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Öne Çıkanlar
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Bilgiler
          </TabsTrigger>
        </TabsList>

        {/* Spesifikasyonlar Tab'ı */}
        <TabsContent value="specs" className="p-6">
          <div className="space-y-6">
            {Object.entries(groupedSpecs).map(([groupName, specs]) => (
              <div key={groupName}>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
                  {groupName}
                </h3>
                <div className="grid gap-3">
                  {specs.map(spec => (
                    <div 
                      key={spec.id} 
                      className={`flex justify-between items-start py-2 ${
                        spec.is_highlighted ? 'bg-blue-50 px-3 rounded-lg' : ''
                      }`}
                    >
                      <span className="font-medium text-gray-700 flex-1">
                        {spec.spec_name}
                      </span>
                      <span className="text-gray-900 font-semibold text-right flex-1">
                        {spec.spec_value}
                      </span>
                      {spec.is_highlighted && (
                        <Star className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Öne Çıkanlar Tab'ı */}
        <TabsContent value="highlights" className="p-6">
          <div className="space-y-4">
            {highlightedSpecs.length > 0 ? (
              <div className="grid gap-4">
                {highlightedSpecs.map(spec => (
                  <div 
                    key={spec.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                  >
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">{spec.spec_name}</h4>
                      <p className="text-blue-700">{spec.spec_value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Öne çıkan özellik bulunmuyor</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Bilgiler Tab'ı */}
        <TabsContent value="info" className="p-6">
          <div className="space-y-6">
            {/* Kargo Bilgisi */}
            {deliveryInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Kargo ve Teslimat</h4>
                    <p className="text-green-700">{deliveryInfo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Garanti Bilgisi */}
            {warranty && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Garanti</h4>
                    <p className="text-blue-700">{warranty}</p>
                  </div>
                </div>
              </div>
            )}

            {/* İade ve Değişim */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3">İade ve Değişim</h4>
              <div className="space-y-2 text-yellow-700">
                <p>• 14 gün içinde koşulsuz iade</p>
                <p>• Ürün ambalajı açılmamış olmalıdır</p>
                <p>• Kargo ücreti alıcıya aittir</p>
                <p>• Değişim talebi için müşteri hizmetlerimizle iletişime geçin</p>
              </div>
            </div>

            {/* Ürün Detayları */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Ürün Detayları</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ürün Adı:</span>
                  <span className="font-medium">{productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Özellik:</span>
                  <span className="font-medium">{specifications.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategori Sayısı:</span>
                  <span className="font-medium">{Object.keys(groupedSpecs).length} kategori</span>
                </div>
                {highlightedSpecs.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Öne Çıkan Özellik:</span>
                    <span className="font-medium">{highlightedSpecs.length} adet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
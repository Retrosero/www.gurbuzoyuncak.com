import { useState } from 'react'
import { ProductImage } from '@/types'
import { ZoomIn, ChevronLeft, ChevronRight, RotateCcw, Download } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
  className?: string
}

export default function ProductImageGallery({ 
  images, 
  productName, 
  className = "" 
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [showModal, setShowModal] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  const currentImage = images[selectedIndex] || images[0]

  const handlePrevious = () => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
  }

  const handleNext = () => {
    setSelectedIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const openModal = (index: number) => {
    setModalIndex(index)
    setShowModal(true)
  }

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a')
      link.href = currentImage.image_url
      link.download = `${productName}-image-${selectedIndex + 1}.jpg`
      link.click()
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg aspect-square flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-center">
          <div className="text-4xl mb-2">📷</div>
          <p>Resim Yok</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Ana Görsel */}
      <div className="relative bg-gray-100 rounded-lg aspect-square mb-4 overflow-hidden group">
        <img 
          src={currentImage.image_url} 
          alt={`${productName} - ${selectedIndex + 1}`}
          className={`w-full h-full object-contain cursor-zoom-in transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'hover:scale-105'
          }`}
          onClick={() => openModal(selectedIndex)}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          }}
        />
        
        {/* Görsel Kontrolleri */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleDownload}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition"
            title="Resmi İndir"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => openModal(selectedIndex)}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition"
            title="Büyüt"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Navigasyon Okları */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Görsel Sayacı */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Görseller */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`border-2 rounded-lg overflow-hidden aspect-square transition-all ${
                selectedIndex === index 
                  ? 'border-blue-600 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img 
                src={image.image_url} 
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 360° View Butonu (gelecek implementasyon için) */}
      <div className="mt-4">
        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition">
          <RotateCcw size={20} />
          <span>360° Görünüm</span>
        </button>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative bg-white rounded-lg overflow-hidden">
            <div className="relative aspect-square">
              <img 
                src={images[modalIndex]?.image_url} 
                alt={`${productName} - ${modalIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Modal Navigasyon */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setModalIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setModalIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Modal Kontrolleri */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = images[modalIndex]?.image_url
                    link.download = `${productName}-image-${modalIndex + 1}.jpg`
                    link.click()
                  }}
                  className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition"
                >
                  <Download size={20} />
                </button>
              </div>
              
              {/* Modal Sayacı */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
                {modalIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
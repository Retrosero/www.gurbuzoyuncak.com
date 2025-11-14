import { Battery } from 'lucide-react'

interface BatterySelectorProps {
  batteryType: string
  batteryCount: number
  onAccept: () => void
  className?: string
}

export default function BatterySelector({ 
  batteryType, 
  batteryCount, 
  onAccept,
  className = '' 
}: BatterySelectorProps) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Battery className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Pil Gereksinimi
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Bu ürün <span className="font-semibold text-amber-700">{batteryCount} adet {batteryType}</span> pil gerektiriyor.
          </p>
          <button
            onClick={onAccept}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
          >
            <Battery className="w-4 h-4" />
            Pil Ekle
          </button>
        </div>
      </div>
    </div>
  )
}

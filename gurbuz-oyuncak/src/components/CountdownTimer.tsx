import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: string
  onExpire?: () => void
  compact?: boolean
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export default function CountdownTimer({ endDate, onExpire, compact = false, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

  function calculateTimeLeft(): TimeLeft {
    const difference = new Date(endDate).getTime() - new Date().getTime()

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.isExpired && onExpire) {
        onExpire()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onExpire])

  if (timeLeft.isExpired) {
    return null
  }

  if (compact) {
    // Kompakt görünüm (ürün kartları için)
    const parts = []
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}g`)
    if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}s`)
    if (timeLeft.days === 0) parts.push(`${timeLeft.minutes}d`)

    return (
      <div className={`flex items-center gap-1 text-xs font-semibold ${className}`}>
        <Clock size={14} className="animate-pulse" />
        <span>Son {parts.join(' ')}</span>
      </div>
    )
  }

  // Tam görünüm (banner için)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock size={20} className="animate-pulse" />
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center min-w-[50px]">
            <span className="text-2xl font-bold">{timeLeft.days}</span>
            <span className="text-xs uppercase">Gün</span>
          </div>
        )}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs uppercase">Saat</span>
        </div>
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs uppercase">Dakika</span>
        </div>
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs uppercase">Saniye</span>
        </div>
      </div>
    </div>
  )
}

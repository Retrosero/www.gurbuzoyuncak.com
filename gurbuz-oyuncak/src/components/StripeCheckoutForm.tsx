import { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { CreditCard, Loader } from 'lucide-react'

interface StripeCheckoutFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export default function StripeCheckoutForm({ amount, onSuccess, onError }: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Kart elementi bulunamadı')
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Payment method başarıyla oluşturuldu
      onSuccess(paymentMethod.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ödeme işlemi başarısız'
      onError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kart Bilgileri
        </label>
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-accent focus-within:border-accent">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0cc0df]/5 to-[#00a8cb]/5 border border-[#0cc0df]/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Ödenecek Tutar:</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] bg-clip-text text-transparent">
            {amount.toFixed(2)} TL
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 transform hover:-translate-y-0.5"
      >
        {processing ? (
          <>
            <Loader className="animate-spin" size={24} />
            İşleniyor...
          </>
        ) : (
          <>
            <CreditCard size={24} />
            Ödemeyi Tamamla
          </>
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        Güvenli ödeme için Stripe kullanılmaktadır
      </div>
    </form>
  )
}

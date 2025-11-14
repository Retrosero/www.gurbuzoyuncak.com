import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '@/types'

interface CartItem {
  product: Product
  quantity: number
  variant_id?: number | null
  giftWrap?: boolean
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  toggleGiftWrap: (productId: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  giftWrapFee: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Sepet yüklenemedi:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function addToCart(product: Product, quantity: number = 1) {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  function removeFromCart(productId: number) {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  function toggleGiftWrap(productId: number) {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId 
          ? { ...item, giftWrap: !item.giftWrap } 
          : item
      )
    )
  }

  function clearCart() {
    setItems([])
  }

  const GIFT_WRAP_FEE_PER_ITEM = 15 // TL
  
  const giftWrapFee = items.reduce((sum, item) => {
    return sum + (item.giftWrap ? GIFT_WRAP_FEE_PER_ITEM * item.quantity : 0)
  }, 0)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => {
    const basePrice = item.product.base_price || 0
    const taxRate = item.product.tax_rate || 0
    const price = basePrice * (1 + taxRate / 100)
    return sum + price * item.quantity
  }, 0) + giftWrapFee

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleGiftWrap,
      clearCart,
      totalItems,
      totalPrice,
      giftWrapFee
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

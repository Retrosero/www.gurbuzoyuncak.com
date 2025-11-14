import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface FavoritesContextType {
  favoritesCount: number
  addToFavorites: (productId: number) => Promise<void>
  removeFromFavorites: (productId: number) => Promise<void>
  toggleFavorite: (productId: number) => Promise<boolean> // true if added, false if removed
  isFavorite: (productId: number) => boolean
  refreshFavoritesCount: () => Promise<void>
  loading: boolean
  // Gelişmiş özellikler
  setPriceThreshold: (productId: number, threshold: number) => Promise<void>
  getPriceHistory: (productId: number) => Promise<any[]>
  getStockAlerts: (productId: number) => Promise<any[]>
  getNotificationSettings: () => Promise<any>
  updateNotificationSettings: (settings: any) => Promise<void>
  getFavoritesWithTracking: () => Promise<any[]>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

interface FavoritesProviderProps {
  children: ReactNode
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user } = useAuth()
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFavorites()
      setupRealtimeSubscription()
    } else {
      setFavoritesCount(0)
      setFavoriteIds(new Set())
    }
  }, [user])

  const fetchFavorites = async () => {
    if (!user) {
      console.log('Kullanıcı giriş yapmamış, favoriler yüklenemiyor')
      return
    }

    try {
      setLoading(true)
      console.log('Favoriler yükleniyor...', { userId: user.id })
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase hatası:', error)
        throw error
      }

      console.log('Favoriler başarıyla yüklendi:', data?.length || 0, 'favori')
      const ids = data?.map(fav => fav.product_id) || []
      setFavoriteIds(new Set(ids))
      setFavoritesCount(ids.length)
    } catch (error: any) {
      console.error('Favoriler yüklenirken hata:', error)
      console.error('Hata detayı:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      toast.error('Favoriler yüklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!user) return

    // Kullanıcının favori değişikliklerini dinle
    const favoritesSubscription = supabase
      .channel('user_favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_favorites',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Favori değişikliği:', payload)
          fetchFavoritesCount()
        }
      )
      .subscribe()

    return () => {
      favoritesSubscription.unsubscribe()
    }
  }

  const fetchFavoritesCount = async () => {
    if (!user) return

    try {
      const { count, error } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) throw error

      setFavoritesCount(count || 0)
    } catch (error) {
      console.error('Favori sayısı alınırken hata:', error)
    }
  }

  const refreshFavoritesCount = async () => {
    await fetchFavorites()
  }

  const addToFavorites = async (productId: number) => {
    if (!user) {
      toast.error('Favorilere eklemek için giriş yapmalısınız')
      return
    }

    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          product_id: productId
        })

      if (error) throw error

      setFavoriteIds(prev => new Set([...prev, productId]))
      setFavoritesCount(prev => prev + 1)
      toast.success('Ürün favorilere eklendi')
    } catch (error: any) {
      console.error('Favori ekleme hatası:', error)
      
      if (error.code === '23505') {
        // Duplicate key error - ürün zaten favorilerde
        toast.info('Ürün zaten favorilerinizde')
      } else {
        toast.error('Favorilere eklenirken hata oluştu')
      }
    }
  }

  const removeFromFavorites = async (productId: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
      setFavoritesCount(prev => Math.max(0, prev - 1))
      toast.success('Ürün favorilerden çıkarıldı')
    } catch (error) {
      console.error('Favori çıkarma hatası:', error)
      toast.error('Favorilerden çıkarılırken hata oluştu')
    }
  }

  const toggleFavorite = async (productId: number): Promise<boolean> => {
    const isCurrentlyFavorite = favoriteIds.has(productId)
    
    if (isCurrentlyFavorite) {
      await removeFromFavorites(productId)
      return false
    } else {
      await addToFavorites(productId)
      return true
    }
  }

  const isFavorite = (productId: number): boolean => {
    return favoriteIds.has(productId)
  }

  // Gelişmiş favori özellikleri
  const setPriceThreshold = async (productId: number, threshold: number): Promise<void> => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_favorites')
        .update({ price_change_threshold: threshold })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error
      toast.success('Fiyat eşiği güncellendi')
    } catch (error) {
      console.error('Fiyat eşiği güncelleme hatası:', error)
      toast.error('Fiyat eşiği güncellenirken hata oluştu')
    }
  }

  const getPriceHistory = async (productId: number): Promise<any[]> => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('favorite_price_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Fiyat geçmişi alınırken hata:', error)
      return []
    }
  }

  const getStockAlerts = async (productId: number): Promise<any[]> => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('favorite_stock_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Stok uyarıları alınırken hata:', error)
      return []
    }
  }

  const getNotificationSettings = async (): Promise<any> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('favorite_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Bildirim ayarları alınırken hata:', error)
      return null
    }
  }

  const updateNotificationSettings = async (settings: any): Promise<void> => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('favorite_notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      toast.success('Bildirim ayarları güncellendi')
    } catch (error) {
      console.error('Bildirim ayarları güncelleme hatası:', error)
      toast.error('Bildirim ayarları güncellenirken hata oluştu')
    }
  }

  const getFavoritesWithTracking = async (): Promise<any[]> => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          products(*),
          favorite_price_tracking(*),
          favorite_stock_tracking(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Favoriler detaylı bilgileri alınırken hata:', error)
      return []
    }
  }

  const value: FavoritesContextType = {
    favoritesCount,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refreshFavoritesCount,
    loading,
    setPriceThreshold,
    getPriceHistory,
    getStockAlerts,
    getNotificationSettings,
    updateNotificationSettings,
    getFavoritesWithTracking
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
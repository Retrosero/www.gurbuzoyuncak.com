import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Profile {
  id: string
  user_id: string
  email: string
  full_name: string
  phone?: string
  customer_type: string
  vip_level: number
  loyalty_points: number
  balance: number
  tax_number?: string
  company_name?: string
  dealer_company_name?: string
  dealer_approved: boolean
  dealer_application_date?: string
  dealer_approval_date?: string
  is_bayi: boolean
  bayi_discount_percentage: number
  created_at: string
  updated_at: string
}

interface UseProfileReturn {
  profile: Profile | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  isBayi: boolean
  isApprovedBayi: boolean
  refetch: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (err) {
      console.error('Profile yüklenirken hata:', err)
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  const isAdmin = profile?.customer_type === 'admin'
  const isBayi = profile?.is_bayi === true || ['B2B', 'Toptan', 'Kurumsal'].includes(profile?.customer_type || '')
  const isApprovedBayi = isBayi && profile?.dealer_approved === true

  return {
    profile,
    loading,
    error,
    isAdmin,
    isBayi,
    isApprovedBayi,
    refetch: fetchProfile
  }
}
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthSettings {
  googleAuthEnabled: boolean
  facebookAuthEnabled: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  authSettings: AuthSettings
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  updateAuthSettings: (settings: Partial<AuthSettings>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authSettings, setAuthSettings] = useState<AuthSettings>({
    googleAuthEnabled: true,
    facebookAuthEnabled: true
  })

  // Auth ayarlarını localStorage'dan yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('auth_settings')
    if (savedSettings) {
      try {
        setAuthSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.warn('Auth ayarları yüklenirken hata:', error)
      }
    }
  }, [])

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user || null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error

    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        full_name: fullName,
        customer_type: 'B2C'
      })
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signInWithFacebook() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  function updateAuthSettings(settings: Partial<AuthSettings>) {
    const newSettings = { ...authSettings, ...settings }
    setAuthSettings(newSettings)
    localStorage.setItem('auth_settings', JSON.stringify(newSettings))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      authSettings,
      signIn, 
      signUp, 
      signOut, 
      signInWithGoogle,
      signInWithFacebook,
      updateAuthSettings
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

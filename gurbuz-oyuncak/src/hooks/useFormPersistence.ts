import { useState, useEffect, useCallback } from 'react'

interface FormPersistenceOptions {
  key: string
  excludeFields?: string[]
  onRestore?: () => void
}

export function useFormPersistence<T extends Record<string, any>>(
  initialData: T,
  options: FormPersistenceOptions
) {
  const { key, excludeFields = [], onRestore } = options
  const storageKey = `form_persist_${key}`

  const [formData, setFormData] = useState<T>(initialData)
  const [hasSavedData, setHasSavedData] = useState(false)

  // Kaydedilmiş veri var mı kontrol et
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setHasSavedData(true)
    }
  }, [storageKey])

  // Kaydedilmiş veriyi geri yükle
  const restoreData = useCallback(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
        setHasSavedData(false)
        onRestore?.()
      } catch (error) {
        console.error('Form verisi geri yüklenemedi:', error)
      }
    }
  }, [storageKey, onRestore])

  // Veriyi kaydet
  const saveData = useCallback((data: T) => {
    const dataToSave = { ...data }
    
    // Hariç tutulacak alanları kaldır
    excludeFields.forEach(field => {
      delete dataToSave[field]
    })

    localStorage.setItem(storageKey, JSON.stringify(dataToSave))
  }, [storageKey, excludeFields])

  // Kaydedilmiş veriyi temizle
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(storageKey)
    setHasSavedData(false)
  }, [storageKey])

  // Form değiştiğinde otomatik kaydet (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Boş form kaydetme
      const hasData = Object.values(formData).some(value => {
        if (typeof value === 'string') return value.trim() !== ''
        if (typeof value === 'number') return value !== 0
        if (Array.isArray(value)) return value.length > 0
        return Boolean(value)
      })

      if (hasData) {
        saveData(formData)
      }
    }, 1000) // 1 saniye debounce

    return () => clearTimeout(timer)
  }, [formData, saveData])

  // Sayfa kapatılırken uyarı
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [storageKey])

  return {
    formData,
    setFormData,
    hasSavedData,
    restoreData,
    clearSavedData,
    saveData
  }
}

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, AlertCircle, CheckCircle, FileText, RefreshCw, History, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface SyncResult {
  processed_products: number
  new_products: number
  updated_products: number
  images_added: number
  total_parsed: number
}

type UploadMode = 'file' | 'url'

export default function AdminXMLUpload() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [uploadMode, setUploadMode] = useState<UploadMode>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-19), `${new Date().toLocaleTimeString()} - ${message}`])
  }, [])

  // URL validation
  const isValidUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // XML URL validation
  const isValidXmlUrl = (urlString: string): boolean => {
    if (!isValidUrl(urlString)) return false
    return urlString.toLowerCase().includes('.xml') || urlString.toLowerCase().includes('xml')
  }

  // File validation
  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return 'Sadece XML dosyaları yüklenebilir'
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return `Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    }

    return null
  }

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const error = validateFile(droppedFile)
      if (error) {
        setErrors([error])
      } else {
        setFile(droppedFile)
        setErrors([])
        setUploadMode('file')
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const error = validateFile(selectedFile)
      if (error) {
        setErrors([error])
      } else {
        setFile(selectedFile)
        setErrors([])
      }
    }
  }

  async function handleUpload() {
    setErrors([])
    setResult(null)
    setLogs([])
    
    let xmlContent = ''
    let xmlUrl = ''
    let filename = ''

    if (uploadMode === 'file') {
      if (!file) {
        setErrors(['Lütfen bir dosya seçin'])
        return
      }
      
      const fileError = validateFile(file)
      if (fileError) {
        setErrors([fileError])
        return
      }

      setUploading(true)
      addLog('Dosya okunuyor...')
      
      try {
        xmlContent = await file.text()
        filename = file.name
        addLog(`Dosya yüklendi: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      } catch (error: any) {
        setErrors(['Dosya okuma hatası: ' + error.message])
        setUploading(false)
        return
      }
    } else {
      if (!url.trim()) {
        setErrors(['Lütfen geçerli bir XML URL\'si girin'])
        return
      }
      
      if (!isValidXmlUrl(url)) {
        setErrors(['Geçerli bir XML URL\'si girin (http/https ile başlamalı)'])
        return
      }

      setUploading(true)
      addLog('URL doğrulandı, server\'a gönderiliyor...')
      xmlUrl = url
      filename = url.split('/').pop() || 'remote.xml'
    }

    try {
      addLog('Senkronizasyon başlatılıyor...')
      
      const { data, error } = await supabase.functions.invoke('xml-product-upload-v2', {
        body: {
          xml_content: xmlContent || undefined,
          xml_url: xmlUrl || undefined,
          test_mode: false
        }
      })

      if (error) throw error

      if (data.success) {
        setResult(data.data)
        addLog(`XML yükleme tamamlandı: ${data.message}`)
      } else {
        throw new Error(data.error?.message || 'XML yükleme başarısız')
      }
      
    } catch (error: any) {
      const errorMessage = error.message || 'Bilinmeyen hata'
      setErrors([errorMessage])
      addLog(`Hata: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">XML Ürün Senkronizasyonu</h1>
              <p className="text-green-100 mt-2">Akıllı ürün yönetimi ile otomatik güncelleme</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/xml/gecmis')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors"
              >
                <History className="w-5 h-5" />
                Geçmiş
              </button>
              <button
                onClick={() => navigate('/admin/xml/ayarlar')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5" />
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* İşlem Özeti Banner */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-900 mb-2">Akıllı Senkronizasyon Nedir?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Yeni ürünleri otomatik ekler</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-green-600" />
              <span>Fiyat ve stok günceller</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-orange-600" />
              <span>Stok biten ürünleri pasifleştirir</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>XML'de olmayan ürünleri devre dışı bırakır</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6">XML Kaynağı Seç</h2>
            
            {/* Upload Mode Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => {
                    setUploadMode('file')
                    setUrl('')
                    setErrors([])
                    setResult(null)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload size={16} />
                  Dosya Yükleme
                </button>
                <button
                  onClick={() => {
                    setUploadMode('url')
                    setFile(null)
                    setErrors([])
                    setResult(null)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === 'url'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText size={16} />
                  URL Yükleme
                </button>
              </div>
            </div>

            {/* File Upload Mode */}
            {uploadMode === 'file' && (
              <div>
                {/* Drag & Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`mx-auto mb-4 ${dragOver ? 'text-green-500' : 'text-gray-400'}`} size={48} />
                  <p className="text-lg font-medium mb-2">
                    Dosyayı buraya sürükleyin veya seçin
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Sadece XML dosyaları, maksimum 10MB</p>
                  
                  <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="bg-green-700 text-white px-6 py-2 rounded-xl hover:bg-green-800 cursor-pointer inline-block"
                  >
                    Dosya Seç
                  </label>
                </div>

                {/* File Info */}
                {file && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URL Upload Mode */}
            {uploadMode === 'url' && (
              <div>
                <label htmlFor="xml-url" className="block text-sm font-medium text-gray-700 mb-2">
                  XML URL Adresi
                </label>
                <div className="relative">
                  <input
                    id="xml-url"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setErrors([])
                    }}
                    placeholder="https://example.com/products.xml"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <FileText className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
                {url && !isValidXmlUrl(url) && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ URL .xml içermiyor, yine de deneyebilirsiniz
                  </p>
                )}
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-medium text-red-800">Hata</h3>
                </div>
                <ul className="mt-2 text-sm text-red-700">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || (uploadMode === 'file' && !file) || (uploadMode === 'url' && !url.trim())}
              className="w-full mt-6 bg-green-700 text-white py-3 px-6 rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Senkronizasyon yapılıyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  <span>Senkronizasyonu Başlat</span>
                </>
              )}
            </button>
          </div>

          {/* Logs Section */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6">İşlem Logları</h2>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center space-x-2">
                  <span>Canlı Loglar</span>
                  {uploading && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                </h3>
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Temizle
                  </button>
                )}
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Henüz log yok...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Senkronizasyon Sonuçları
            </h2>
            
            {/* XML Upload Stats */}
            <div className="mb-6 p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-3">XML Yükleme İstatistikleri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-600">{result.total_parsed}</div>
                  <div className="text-xs text-green-800">Parse Edilen</div>
                </div>
                <div className="bg-white p-3 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-600">{result.processed_products}</div>
                  <div className="text-xs text-green-800">İşlenen Ürün</div>
                </div>
                <div className="bg-white p-3 rounded-xl text-center">
                  <div className="text-xl font-bold text-purple-600">{result.new_products}</div>
                  <div className="text-xs text-purple-800">Yeni Ürün</div>
                </div>
                <div className="bg-white p-3 rounded-xl text-center">
                  <div className="text-xl font-bold text-orange-600">{result.updated_products}</div>
                  <div className="text-xs text-orange-800">Güncellenen</div>
                </div>
              </div>
            </div>
            
            {/* Products Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{result.images_added}</div>
                <div className="text-sm text-green-800">Eklenen Resim</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{result.processed_products}/{result.total_parsed}</div>
                <div className="text-sm text-green-800">Başarı Oranı</div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate('/admin/xml/gecmis')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                <History className="w-4 h-4" />
                Detaylı Geçmişi Görüntüle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

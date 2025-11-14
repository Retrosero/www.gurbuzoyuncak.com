import { useState } from 'react'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface PDFUploadProps {
  onUploadComplete: (pdfUrl: string, pdfName: string) => void
  onCancel: () => void
  required?: boolean
}

export default function PDFUploadComponent({ onUploadComplete, onCancel, required = false }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Sadece PDF dosyaları yüklenebilir')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu maksimum 10MB olabilir')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Lütfen bir PDF dosyası seçin')
      return
    }

    try {
      setUploading(true)

      // Generate unique filename
      const fileExt = 'pdf'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `orders/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('order-pdfs')
        .upload(filePath, selectedFile, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('order-pdfs')
        .getPublicUrl(filePath)

      toast.success('PDF başarıyla yüklendi')
      onUploadComplete(publicUrl, selectedFile.name)
    } catch (error: any) {
      console.error('PDF yükleme hatası:', error)
      toast.error('PDF yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Pazaryeri Fişi Yükle
            {required && <span className="text-red-500">*</span>}
          </h3>
          <button
            onClick={onCancel}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {required && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-yellow-800">
              E-ticaret müşterileri için pazaryeri fişi yüklemesi zorunludur.
            </p>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-3">
              <FileText className="mx-auto text-blue-600" size={48} />
              <div>
                <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 hover:text-red-700 text-sm underline"
              >
                Dosyayı Değiştir
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="mx-auto text-gray-400" size={48} />
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  PDF dosyasını sürükleyin veya seçin
                </p>
                <p className="text-sm text-gray-500">
                  Maksimum dosya boyutu: 10MB
                </p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition"
              >
                Dosya Seç
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {!required && (
            <button
              onClick={onCancel}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              İptal
            </button>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`${required ? 'w-full' : 'flex-1'} px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload size={18} />
                Yükle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

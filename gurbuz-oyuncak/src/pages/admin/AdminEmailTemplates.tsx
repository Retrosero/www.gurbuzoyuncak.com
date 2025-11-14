import { useState, useEffect } from 'react'
import { Mail, Plus, Edit2, Trash2, Eye, Code, Save, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  template_type: 'order' | 'welcome' | 'notification' | 'promotion'
  content: string
  variables: string[]
  is_active: boolean
  created_at: string
}

const TEMPLATE_TYPES = [
  { value: 'order', label: 'Sipariş E-postaları', color: 'bg-green-100 text-green-800' },
  { value: 'welcome', label: 'Hoş Geldin E-postaları', color: 'bg-green-100 text-green-800' },
  { value: 'notification', label: 'Bildirim E-postaları', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'promotion', label: 'Promosyon E-postaları', color: 'bg-purple-100 text-purple-800' }
]

const AVAILABLE_VARIABLES = [
  { key: '{{user_name}}', description: 'Kullanıcı adı' },
  { key: '{{order_number}}', description: 'Sipariş numarası' },
  { key: '{{order_total}}', description: 'Sipariş tutarı' },
  { key: '{{product_name}}', description: 'Ürün adı' },
  { key: '{{company_name}}', description: 'Firma adı' },
  { key: '{{current_date}}', description: 'Güncel tarih' }
]

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error: any) {
      console.error('Error loading templates:', error)
      toast.error('Şablonlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || template.template_type === filterType
    return matchesSearch && matchesType
  })

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({...template})
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingTemplate) return

    try {
      if (editingTemplate.id) {
        // Update existing
        const { error } = await supabase
          .from('admin_email_templates')
          .update({
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            template_type: editingTemplate.template_type,
            content: editingTemplate.content,
            variables: editingTemplate.variables,
            is_active: editingTemplate.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id)

        if (error) throw error
        toast.success('Şablon başarıyla güncellendi')
      } else {
        // Create new
        const { error } = await supabase
          .from('admin_email_templates')
          .insert([{
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            template_type: editingTemplate.template_type,
            content: editingTemplate.content,
            variables: editingTemplate.variables,
            is_active: editingTemplate.is_active
          }])

        if (error) throw error
        toast.success('Şablon başarıyla oluşturuldu')
      }

      setIsEditing(false)
      setEditingTemplate(null)
      loadTemplates()
    } catch (error: any) {
      console.error('Error saving template:', error)
      toast.error('Şablon kaydedilirken hata oluştu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu şablonu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('admin_email_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Şablon başarıyla silindi')
      loadTemplates()
    } catch (error: any) {
      console.error('Error deleting template:', error)
      toast.error('Şablon silinirken hata oluştu')
    }
  }

  const handleAddNew = () => {
    setEditingTemplate({
      id: '',
      name: '',
      subject: '',
      template_type: 'order',
      content: '',
      variables: [],
      is_active: true,
      created_at: ''
    })
    setIsEditing(true)
  }

  const insertVariable = (variable: string) => {
    if (!editingTemplate) return
    setEditingTemplate({
      ...editingTemplate,
      content: editingTemplate.content + ' ' + variable,
      variables: [...new Set([...editingTemplate.variables, variable])]
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail size={32} className="text-green-600" />
              E-posta Şablonları
            </h1>
            <p className="text-gray-600 mt-2">E-posta şablonlarını yönetin ve düzenleyin</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Yeni Şablon
          </button>
        </div>

        {!isEditing && !previewTemplate ? (
          <div className="bg-white rounded-xl shadow-sm">
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Şablon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tüm Tipler</option>
                    {TEMPLATE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Templates List */}
            <div className="divide-y divide-gray-200">
              {filteredTemplates.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Şablon Bulunamadı
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filterType !== 'all' ? 'Arama kriterlerine uygun şablon bulunamadı' : 'Henüz şablon eklenmemiş'}
                  </p>
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const typeInfo = TEMPLATE_TYPES.find(t => t.value === template.template_type)
                  return (
                    <div key={template.id} className="p-4 lg:p-6 hover:bg-gray-50 transition">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${typeInfo?.color} whitespace-nowrap`}>
                              {typeInfo?.label}
                            </span>
                            {template.is_active && (
                              <span className="px-2 lg:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 break-words">
                            <strong>Konu:</strong> {template.subject}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {template.variables?.map((variable, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Desktop: Yanyana butonlar */}
                        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-xl"
                            title="Önizle"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleEdit(template)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                            title="Düzenle"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                            title="Sil"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        {/* Mobile: Grid butonlar */}
                        <div className="grid grid-cols-3 gap-2 lg:hidden">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl text-sm"
                          >
                            <Eye size={16} />
                            <span>Önizle</span>
                          </button>
                          <button
                            onClick={() => handleEdit(template)}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm"
                          >
                            <Edit2 size={16} />
                            <span>Düzenle</span>
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm"
                          >
                            <Trash2 size={16} />
                            <span>Sil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : previewTemplate ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Şablon Önizleme</h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl flex items-center gap-2"
              >
                <X size={20} />
                Kapat
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şablon Adı</label>
                <p className="text-gray-900">{previewTemplate.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                <p className="text-gray-900">{previewTemplate.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
                <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap font-mono text-sm">
                  {previewTemplate.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingTemplate?.id ? 'Şablon Düzenle' : 'Yeni Şablon'}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditingTemplate(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl flex items-center gap-2"
              >
                <X size={20} />
                İptal
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şablon Adı</label>
                  <input
                    type="text"
                    value={editingTemplate?.name || ''}
                    onChange={(e) => setEditingTemplate({...editingTemplate!, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Örn: Sipariş Onay E-postası"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tip</label>
                  <select
                    value={editingTemplate?.template_type || 'order'}
                    onChange={(e) => setEditingTemplate({...editingTemplate!, template_type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {TEMPLATE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                  <input
                    type="text"
                    value={editingTemplate?.subject || ''}
                    onChange={(e) => setEditingTemplate({...editingTemplate!, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="E-posta konusu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
                  <textarea
                    value={editingTemplate?.content || ''}
                    onChange={(e) => setEditingTemplate({...editingTemplate!, content: e.target.value})}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="E-posta içeriği..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate?.is_active || false}
                      onChange={(e) => setEditingTemplate({...editingTemplate!, is_active: e.target.checked})}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!editingTemplate?.name || !editingTemplate?.subject || !editingTemplate?.content}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Kaydet
                </button>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Code size={20} />
                    Değişkenler
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kullanılabilir değişkenleri içeriğe eklemek için tıklayın
                  </p>
                  <div className="space-y-2">
                    {AVAILABLE_VARIABLES.map((variable) => (
                      <button
                        key={variable.key}
                        onClick={() => insertVariable(variable.key)}
                        className="w-full text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group"
                      >
                        <code className="text-sm font-mono text-green-600 group-hover:text-green-700">
                          {variable.key}
                        </code>
                        <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

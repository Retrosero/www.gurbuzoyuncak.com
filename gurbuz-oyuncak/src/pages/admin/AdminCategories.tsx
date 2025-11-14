import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FolderTree, Plus, Edit2, Trash2, Search, ChevronRight, 
  ChevronDown, MoveUp, MoveDown, X, AlertCircle, CheckCircle,
  Loader2, Save
} from 'lucide-react'
import { Category } from '../../types'

interface CategoryFormData {
  name: string
  slug: string
  parent_id: number | null
  level: number
  order_index: number
  is_active: boolean
}

interface CategoryFormErrors {
  name?: string
  slug?: string
  parent?: string
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [loadingForm, setLoadingForm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parent_id: null,
    level: 1,
    order_index: 0,
    is_active: true
  })
  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({})

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) throw error

      const categorized = organizeCategories(data || [])
      setCategories(categorized)
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
      showToast('Kategoriler yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Organize categories into hierarchical structure
  const organizeCategories = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>()
    const rootCategories: Category[] = []

    // First pass: create map
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Second pass: build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)!
        if (!parent.children) parent.children = []
        parent.children.push(category)
      } else {
        rootCategories.push(category)
      }
    })

    return rootCategories
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: CategoryFormErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Kategori adı gereklidir'
    } else if (formData.name.length < 2) {
      errors.name = 'Kategori adı en az 2 karakter olmalıdır'
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug gereklidir'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug sadece küçük harf, rakam ve tire içerebilir'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Add new category
  const addCategory = async () => {
    if (!validateForm()) return

    setLoadingForm(true)
    try {
      // Check for duplicate name or slug
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .or(`name.eq.${formData.name},slug.eq.${formData.slug}`)

      if (existing && existing.length > 0) {
        setFormErrors({ 
          name: 'Bu isimde veya slug\'ta kategori zaten mevcut',
          slug: 'Bu isimde veya slug\'ta kategori zaten mevcut'
        })
        return
      }

      // Get next order_index for level
      const { data: maxOrder } = await supabase
        .from('categories')
        .select('order_index')
        .eq('parent_id', formData.parent_id)
        .eq('level', formData.level)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrder = (maxOrder?.[0]?.order_index || 0) + 1

      const { error } = await supabase
        .from('categories')
        .insert({
          ...formData,
          order_index: nextOrder
        })

      if (error) throw error

      showToast('Kategori başarıyla eklendi', 'success')
      setIsAddModalOpen(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Kategori eklenemedi:', error)
      showToast('Kategori eklenirken hata oluştu', 'error')
    } finally {
      setLoadingForm(false)
    }
  }

  // Update category
  const updateCategory = async () => {
    if (!editingCategory || !validateForm()) return

    setLoadingForm(true)
    try {
      // Check for duplicate name or slug (excluding current category)
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .or(`name.eq.${formData.name},slug.eq.${formData.slug}`)
        .neq('id', editingCategory.id)

      if (existing && existing.length > 0) {
        setFormErrors({ 
          name: 'Bu isimde veya slug\'ta kategori zaten mevcut',
          slug: 'Bu isimde veya slug\'ta kategori zaten mevcut'
        })
        return
      }

      const { error } = await supabase
        .from('categories')
        .update(formData)
        .eq('id', editingCategory.id)

      if (error) throw error

      showToast('Kategori başarıyla güncellendi', 'success')
      setIsEditModalOpen(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Kategori güncellenemedi:', error)
      showToast('Kategori güncellenirken hata oluştu', 'error')
    } finally {
      setLoadingForm(false)
    }
  }

  // Delete category
  const deleteCategory = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      // Check if category has children
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', id)

      if (children && children.length > 0) {
        showToast('Alt kategorileri olan kategoriler silinemez', 'error')
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      showToast('Kategori başarıyla silindi', 'success')
      fetchCategories()
    } catch (error) {
      console.error('Kategori silinemedi:', error)
      showToast('Kategori silinirken hata oluştu', 'error')
    }
  }

  // Toggle active status
  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      showToast(`Kategori ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi`, 'success')
      fetchCategories()
    } catch (error) {
      console.error('Durum değiştirilemedi:', error)
      showToast('Durum değiştirilirken hata oluştu', 'error')
    }
  }

  // Move category up/down
  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    try {
      const siblings = categories
        .filter(cat => cat.parent_id === category.parent_id)
        .sort((a, b) => a.order_index - b.order_index)

      const currentIndex = siblings.findIndex(cat => cat.id === category.id)
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (targetIndex < 0 || targetIndex >= siblings.length) return

      const targetCategory = siblings[targetIndex]
      const currentOrder = category.order_index
      const targetOrder = targetCategory.order_index

      // Swap order indexes
      const { error: error1 } = await supabase
        .from('categories')
        .update({ order_index: targetOrder })
        .eq('id', category.id)

      const { error: error2 } = await supabase
        .from('categories')
        .update({ order_index: currentOrder })
        .eq('id', targetCategory.id)

      if (error1 || error2) throw error1 || error2

      showToast('Kategori sırası değiştirildi', 'success')
      fetchCategories()
    } catch (error) {
      console.error('Sıra değiştirilemedi:', error)
      showToast('Sıra değiştirilirken hata oluştu', 'error')
    }
  }

  // Drag and drop reorder
  const handleDragStart = (e: React.DragEvent, category: Category) => {
    e.dataTransfer.setData('text/plain', category.id.toString())
  }

  const handleDragOver = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault()
    setDragOverCategory(categoryId)
  }

  const handleDrop = async (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault()
    setDragOverCategory(null)

    const draggedId = parseInt(e.dataTransfer.getData('text/plain'))
    if (draggedId === targetCategory.id) return

    try {
      const { error } = await supabase
        .from('categories')
        .update({ order_index: targetCategory.order_index })
        .eq('id', draggedId)

      if (error) throw error

      showToast('Kategori sırası değiştirildi', 'success')
      fetchCategories()
    } catch (error) {
      console.error('Sıra değiştirilemedi:', error)
      showToast('Sıra değiştirilirken hata oluştu', 'error')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      parent_id: null,
      level: 1,
      order_index: 0,
      is_active: true
    })
    setFormErrors({})
  }

  // Show toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Open edit modal
  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      level: category.level,
      order_index: category.order_index,
      is_active: category.is_active
    })
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  // Open add modal
  const openAddModal = (parentId?: number) => {
    resetForm()
    setFormData(prev => ({
      ...prev,
      parent_id: parentId || null,
      level: parentId ? 2 : 1
    }))
    setIsAddModalOpen(true)
  }

  // Toggle category expansion
  const toggleExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Get category level text
  const getCategoryLevel = (level: number) => {
    switch(level) {
      case 1: return 'Ana Kategori'
      case 2: return 'Alt Kategori'
      case 3: return 'Alt-Alt Kategori'
      default: return 'Kategori'
    }
  }

  // Filter categories for display
  const getDisplayCategories = (categories: Category[]): Category[] => {
    const filterRecursive = (cats: Category[]): Category[] => {
      return cats
        .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(cat => ({
          ...cat,
          children: cat.children ? filterRecursive(cat.children) : []
        }))
    }

    return filterRecursive(categories)
  }

  // Get all categories for parent selection
  const getAllCategories = (): Category[] => {
    const flatten = (cats: Category[]): Category[] => {
      return cats.flatMap(cat => [cat, ...(cat.children ? flatten(cat.children) : [])])
    }
    return flatten(categories)
  }

  // Render category tree
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-3 hover:bg-gray-50 border-l-2 ${
            category.is_active ? 'border-green-500' : 'border-gray-300'
          } ${dragOverCategory === category.id ? 'bg-green-50 border-green-500' : ''}`}
          style={{ marginLeft: `${level * 24}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, category)}
          onDragOver={(e) => handleDragOver(e, category.id)}
          onDrop={(e) => handleDrop(e, category)}
        >
          {/* Expand/Collapse button */}
          {category.children && category.children.length > 0 && (
            <button
              onClick={() => toggleExpansion(category.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          
          {/* Category icon */}
          <FolderTree className={`${category.is_active ? 'text-green-600' : 'text-gray-400'}`} size={18} />
          
          {/* Category info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 truncate">
                {category.name}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {getCategoryLevel(category.level)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Slug: {category.slug} | Sıra: {category.order_index}
            </div>
          </div>

          {/* Status badge */}
          <button
            onClick={() => toggleActive(category.id, category.is_active)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-md hover:border-green-500/50 ${
              category.is_active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.is_active ? 'Aktif' : 'Pasif'}
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Add child button */}
            <button
              onClick={() => openAddModal(category.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition"
              title="Alt Kategori Ekle"
            >
              <Plus size={16} />
            </button>

            {/* Move up button */}
            <button
              onClick={() => moveCategory(category, 'up')}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              title="Yukarı Taşı"
            >
              <MoveUp size={14} />
            </button>

            {/* Move down button */}
            <button
              onClick={() => moveCategory(category, 'down')}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              title="Aşağı Taşı"
            >
              <MoveDown size={14} />
            </button>

            {/* Edit button */}
            <button
              onClick={() => openEditModal(category)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition"
              title="Düzenle"
            >
              <Edit2 size={16} />
            </button>

            {/* Delete button */}
            <button
              onClick={() => deleteCategory(category.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Render children */}
        {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-gray-600">Kategoriler yükleniyor...</span>
        </div>
      </div>
    )
  }

  const displayCategories = getDisplayCategories(categories)
  const allCategories = getAllCategories()

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h2>
          <p className="text-gray-600 mt-1">Hiyerarşik kategori yapısını yönetin</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Yeni Kategori
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Toplam Kategori</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{allCategories.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Aktif Kategoriler</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {allCategories.filter(c => c.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Ana Kategoriler</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {categories.filter(c => c.level === 1).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Alt Kategoriler</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {allCategories.filter(c => c.level === 2).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
          />
        </div>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Kategori Hiyerarşisi</h3>
          <p className="text-sm text-gray-600 mt-1">
            Drag & drop ile sıralama yapabilir, alt kategoriler ekleyebilirsiniz
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {displayCategories.length > 0 ? (
            renderCategoryTree(displayCategories)
          ) : (
            <div className="text-center py-12">
              <FolderTree className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Kategori bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Yeni Kategori Ekle</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ana Kategori (İsteğe bağlı)
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    parent_id: e.target.value ? parseInt(e.target.value) : null,
                    level: e.target.value ? 2 : 1
                  }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                >
                  <option value="">Ana Kategori</option>
                  {categories.filter(cat => cat.level === 1).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori adını girin"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, slug: e.target.value }))
                    if (formErrors.slug) setFormErrors(prev => ({ ...prev, slug: undefined }))
                  }}
                  className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg ${
                    formErrors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="kategori-slug"
                />
                {formErrors.slug && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active-status"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <label htmlFor="active-status" className="text-sm font-medium text-gray-700">
                  Aktif kategori
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={addCategory}
                disabled={loadingForm}
                className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingForm ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Kategori Düzenle</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ana Kategori (İsteğe bağlı)
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    parent_id: e.target.value ? parseInt(e.target.value) : null,
                    level: e.target.value ? 2 : 1
                  }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                >
                  <option value="">Ana Kategori</option>
                  {categories.filter(cat => cat.id !== editingCategory.id && cat.level === 1).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori adını girin"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, slug: e.target.value }))
                    if (formErrors.slug) setFormErrors(prev => ({ ...prev, slug: undefined }))
                  }}
                  className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg ${
                    formErrors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="kategori-slug"
                />
                {formErrors.slug && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>
                )}
              </div>

              {/* Level info */}
              <div>
                <p className="text-sm text-gray-600">
                  Seviye: <span className="font-medium">{getCategoryLevel(formData.level)}</span>
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-active-status"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <label htmlFor="edit-active-status" className="text-sm font-medium text-gray-700">
                  Aktif kategori
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={updateCategory}
                disabled={loadingForm}
                className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingForm ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Güncelle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
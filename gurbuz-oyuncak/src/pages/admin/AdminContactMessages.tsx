import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Clock, CheckCircle, XCircle, User, Mail, Phone, Calendar } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  category?: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  response?: string
  created_at: string
  updated_at: string
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [responseText, setResponseText] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateMessageStatus(id: string, status: string, response?: string) {
    try {
      const updateData: any = { status }
      if (response) {
        updateData.response = response
        updateData.responded_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      // Local state'i güncelle
      setMessages(prev => prev.map(msg => 
        msg.id === id 
          ? { ...msg, status: status as any, response: response || msg.response, updated_at: new Date().toISOString() }
          : msg
      ))

      // Dialog'u kapat
      setSelectedMessage(null)
      setResponseText('')

      // Google Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_response', {
          event_category: 'Admin',
          event_label: `Status: ${status}`
        })
      }
    } catch (error) {
      console.error('Mesaj güncellenirken hata:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-red-100 text-red-800', label: 'Yeni', icon: Clock },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'İşlemde', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Çözüldü', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Kapalı', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-green-100 text-green-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal}>
        {priority === 'urgent' && 'Acil'}
        {priority === 'high' && 'Yüksek'}
        {priority === 'normal' && 'Normal'}
        {priority === 'low' && 'Düşük'}
      </Badge>
    )
  }

  const filteredMessages = messages.filter(msg => {
    if (filter !== 'all' && msg.category !== filter) return false
    if (statusFilter !== 'all' && msg.status !== statusFilter) return false
    return true
  })

  const messageStats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    inProgress: messages.filter(m => m.status === 'in_progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">İletişim Mesajları</h1>
          <p className="text-gray-600">Müşteri mesajlarını yönetin ve yanıtlayın</p>
        </div>
        <Button onClick={loadMessages} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{messageStats.total}</p>
              <p className="text-sm text-gray-600">Toplam Mesaj</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{messageStats.new}</p>
              <p className="text-sm text-gray-600">Yeni Mesaj</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{messageStats.inProgress}</p>
              <p className="text-sm text-gray-600">İşlemde</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{messageStats.resolved}</p>
              <p className="text-sm text-gray-600">Çözüldü</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="siparis">Sipariş</option>
              <option value="urun">Ürün</option>
              <option value="odeme">Ödeme</option>
              <option value="kargo">Kargo</option>
              <option value="iade">İade/Değişim</option>
              <option value="teknik">Teknik Destek</option>
              <option value="sikayet">Şikayet</option>
              <option value="oneri">Öneri</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Durum</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="new">Yeni</option>
              <option value="in_progress">İşlemde</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapalı</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <div className="grid gap-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">{message.name}</h3>
                  <p className="text-sm text-gray-600">{message.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(message.priority)}
                {getStatusBadge(message.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {message.email}
              </div>
              {message.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {message.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {new Date(message.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {message.category && (
                <Badge variant="outline" className="w-fit">
                  {message.category}
                </Badge>
              )}
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{message.message}</p>

            {message.response && (
              <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
                <p className="text-sm font-medium text-green-800 mb-1">Yanıt:</p>
                <p className="text-sm text-green-700">{message.response}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMessage(message)}
                  >
                    {message.response ? 'Yanıtı Düzenle' : 'Yanıtla'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Mesaja Yanıt Ver</DialogTitle>
                  </DialogHeader>
                  {selectedMessage && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <h4 className="font-medium mb-2">Orijinal Mesaj:</h4>
                        <p className="text-sm">{selectedMessage.message}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Yanıtınız</label>
                        <Textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={5}
                          placeholder="Müşteriye yanıtınızı yazın..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => updateMessageStatus(selectedMessage.id, 'resolved', responseText)}
                          disabled={!responseText.trim()}
                        >
                          Çözüldü Olarak İşaretle
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage.id, 'in_progress')}
                        >
                          İşlemde Olarak İşaretle
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => updateMessageStatus(selectedMessage.id, 'closed')}
                        >
                          Kapat
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`)}
              >
                E-posta Gönder
              </Button>
            </div>
          </Card>
        ))}

        {filteredMessages.length === 0 && (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Mesaj bulunamadı</h3>
            <p className="text-gray-500">Seçilen filtrelere uygun mesaj yok.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { StockAlert, AdminSetting, Product } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';

const StockAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);

  // Yeni ayarları tutmak için state
  const [newSettings, setNewSettings] = useState({
    stock_low_threshold: 10,
    stock_critical_threshold: 5,
    stock_out_threshold: 0,
    stock_alert_email_enabled: true,
    stock_alert_email_recipients: '["admin@gurbuzoyuncak.com"]',
    stock_check_frequency: 60,
    stock_auto_resolve: false,
    stock_alert_webhook: ''
  });

  useEffect(() => {
    loadAlerts();
    loadSettings();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          *,
          product:products (
            id,
            name,
            stock,
            product_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Uyarılar yüklenirken hata:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', [
          'stock_low_threshold',
          'stock_critical_threshold',
          'stock_out_threshold',
          'stock_alert_email_enabled',
          'stock_alert_email_recipients',
          'stock_check_frequency',
          'stock_auto_resolve',
          'stock_alert_webhook'
        ])
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);

      // Ayarları form için uygun forma çevir
      const settingsMap = new Map();
      data?.forEach(setting => {
        settingsMap.set(setting.setting_key, setting.setting_value);
      });

      setNewSettings({
        stock_low_threshold: parseInt(settingsMap.get('stock_low_threshold')) || 10,
        stock_critical_threshold: parseInt(settingsMap.get('stock_critical_threshold')) || 5,
        stock_out_threshold: parseInt(settingsMap.get('stock_out_threshold')) || 0,
        stock_alert_email_enabled: settingsMap.get('stock_alert_email_enabled') === 'true',
        stock_alert_email_recipients: settingsMap.get('stock_alert_email_recipients') || '["admin@gurbuzoyuncak.com"]',
        stock_check_frequency: parseInt(settingsMap.get('stock_check_frequency')) || 60,
        stock_auto_resolve: settingsMap.get('stock_auto_resolve') === 'true',
        stock_alert_webhook: settingsMap.get('stock_alert_webhook') || ''
      });
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: number, status: 'resolved' | 'ignored') => {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', alertId);

      if (error) throw error;
      loadAlerts();
    } catch (error) {
      console.error('Uyarı güncellenirken hata:', error);
    }
  };

  const handleBulkResolve = async (status: 'resolved' | 'ignored') => {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .in('id', selectedAlerts);

      if (error) throw error;
      setSelectedAlerts([]);
      loadAlerts();
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'boolean' ? value.toString() : 
                      typeof value === 'number' ? value.toString() : value
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      setSettingsDialogOpen(false);
      loadSettings();
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'out_of_stock': return 'Stokta Yok';
      case 'critical_stock': return 'Kritik Stok';
      case 'low_stock': return 'Düşük Stok';
      default: return type;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock': return '🚨';
      case 'critical_stock': return '⚠️';
      case 'low_stock': return '📉';
      default: return 'ℹ️';
    }
  };

  // Filtreleme
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesSearch = !searchTerm || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // İstatistikler
  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.status === 'active' && a.priority === 'critical').length
  };

  if (loading) {
    return (
      <AdminLayout showSidebar={false}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar={false}>
      <div className="space-y-6">
        {/* Başlık */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Stok Uyarı Sistemi</h1>
          <div className="flex gap-2">
            <Button onClick={() => setSettingsDialogOpen(true)} variant="outline">
              Ayarlar
            </Button>
            <Button onClick={loadAlerts} variant="outline">
              Yenile
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border">
            <div className="text-sm text-gray-600">Toplam Uyarı</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <div className="text-sm text-gray-600">Aktif Uyarı</div>
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <div className="text-sm text-gray-600">Çözülen</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <div className="text-sm text-gray-600">Kritik Uyarı</div>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Ürün adı veya mesaj ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="resolved">Çözüldü</SelectItem>
              <SelectItem value="ignored">Yoksayıldı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="critical">Kritik</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="low">Düşük</SelectItem>
            </SelectContent>
          </Select>
          {selectedAlerts.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={() => handleBulkResolve('resolved')} variant="outline" size="sm">
                Toplu Çöz ({selectedAlerts.length})
              </Button>
              <Button onClick={() => handleBulkResolve('ignored')} variant="outline" size="sm">
                Toplu Yoksay
              </Button>
            </div>
          )}
        </div>

        {/* Uyarılar Listesi */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedAlerts.length === filteredAlerts.filter(a => a.status === 'active').length && selectedAlerts.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAlerts(filteredAlerts.filter(a => a.status === 'active').map(a => a.id));
                  } else {
                    setSelectedAlerts([]);
                  }
                }}
              />
              <div className="grid grid-cols-6 gap-4 flex-1 text-sm font-medium text-gray-600">
                <span>Ürün</span>
                <span>Uyarı Tipi</span>
                <span>Mevcut Stok</span>
                <span>Öncelik</span>
                <span>Durum</span>
                <span>Tarih</span>
              </div>
            </div>
          </div>
          <div className="divide-y">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Henüz uyarı bulunmuyor.
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAlerts([...selectedAlerts, alert.id]);
                        } else {
                          setSelectedAlerts(selectedAlerts.filter(id => id !== alert.id));
                        }
                      }}
                      disabled={alert.status !== 'active'}
                    />
                    <div className="grid grid-cols-6 gap-4 flex-1 items-center">
                      <div>
                        <div className="font-medium">{alert.product?.name || 'Bilinmeyen Ürün'}</div>
                        {alert.product?.product_code && (
                          <div className="text-sm text-gray-500">{alert.product.product_code}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{getAlertTypeIcon(alert.alert_type)}</span>
                        <span className="text-sm">{getAlertTypeLabel(alert.alert_type)}</span>
                      </div>
                      <div>
                        <span className="font-medium">{alert.current_stock}</span>
                        <span className="text-sm text-gray-500"> / {alert.threshold_value}</span>
                      </div>
                      <div>
                        <Badge variant={getPriorityColor(alert.priority)}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                          {alert.status === 'active' ? 'Aktif' : 
                           alert.status === 'resolved' ? 'Çözüldü' : 'Yoksayıldı'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(alert.created_at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <>
                          <Button
                            onClick={() => handleResolveAlert(alert.id, 'resolved')}
                            size="sm"
                            variant="outline"
                          >
                            Çöz
                          </Button>
                          <Button
                            onClick={() => handleResolveAlert(alert.id, 'ignored')}
                            size="sm"
                            variant="outline"
                          >
                            Yoksay
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ayarlar Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stok Uyarı Ayarları</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Düşük Stok Eşiği</label>
                <Input
                  type="number"
                  value={newSettings.stock_low_threshold}
                  onChange={(e) => setNewSettings({...newSettings, stock_low_threshold: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kritik Stok Eşiği</label>
                <Input
                  type="number"
                  value={newSettings.stock_critical_threshold}
                  onChange={(e) => setNewSettings({...newSettings, stock_critical_threshold: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stok Bitti Eşiği</label>
                <Input
                  type="number"
                  value={newSettings.stock_out_threshold}
                  onChange={(e) => setNewSettings({...newSettings, stock_out_threshold: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kontrol Sıklığı (dakika)</label>
                <Input
                  type="number"
                  value={newSettings.stock_check_frequency}
                  onChange={(e) => setNewSettings({...newSettings, stock_check_frequency: parseInt(e.target.value) || 60})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-enabled"
                  checked={newSettings.stock_alert_email_enabled}
                  onCheckedChange={(checked) => setNewSettings({...newSettings, stock_alert_email_enabled: !!checked})}
                />
                <label htmlFor="email-enabled" className="text-sm font-medium">
                  E-posta bildirimlerini etkinleştir
                </label>
              </div>
              
              <div>
                <label className="text-sm font-medium">E-posta Alıcıları</label>
                <Textarea
                  value={newSettings.stock_alert_email_recipients}
                  onChange={(e) => setNewSettings({...newSettings, stock_alert_email_recipients: e.target.value})}
                  placeholder='["email1@example.com", "email2@example.com"]'
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Webhook URL</label>
                <Input
                  value={newSettings.stock_alert_webhook}
                  onChange={(e) => setNewSettings({...newSettings, stock_alert_webhook: e.target.value})}
                  placeholder="https://example.com/webhook"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-resolve"
                  checked={newSettings.stock_auto_resolve}
                  onCheckedChange={(checked) => setNewSettings({...newSettings, stock_auto_resolve: !!checked})}
                />
                <label htmlFor="auto-resolve" className="text-sm font-medium">
                  Stok dolduğunda uyarıları otomatik çöz
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveSettings}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default StockAlertsPage;
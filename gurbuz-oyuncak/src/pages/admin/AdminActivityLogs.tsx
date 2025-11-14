import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Activity, 
  Search, 
  Filter, 
  User, 
  Package, 
  ShoppingCart,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ActivityLog {
  id: number;
  user_id: string;
  activity_type: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  session_id: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    role: string;
  };
}

const activityIcons = {
  login: User,
  logout: User,
  create_product: Package,
  update_product: Package,
  delete_product: Package,
  create_order: ShoppingCart,
  update_order: ShoppingCart,
  delete_order: ShoppingCart,
  role_change: Settings,
  status_change: Settings,
  view_dashboard: Activity,
  profile_update: User
};

const activityLabels = {
  login: 'Giriş',
  logout: 'Çıkış',
  create_product: 'Ürün Eklendi',
  update_product: 'Ürün Güncellendi',
  delete_product: 'Ürün Silindi',
  create_order: 'Sipariş Oluşturuldu',
  update_order: 'Sipariş Güncellendi',
  delete_order: 'Sipariş Silindi',
  role_change: 'Rol Değişikliği',
  status_change: 'Durum Değişikliği',
  view_dashboard: 'Dashboard Görüntülendi',
  profile_update: 'Profil Güncellendi'
};

const resourceLabels = {
  product: 'Ürün',
  order: 'Sipariş',
  category: 'Kategori',
  user: 'Kullanıcı',
  settings: 'Ayarlar',
  session: 'Oturum'
};

export default function AdminActivityLogs() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          profile:profiles!user_activities_user_id_fkey(full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Aktivite logları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Tarih', 'Kullanıcı', 'Email', 'Rol', 'Aktivite', 'Kaynak', 'IP', 'Detaylar'],
      ...filteredActivities.map(activity => [
        format(new Date(activity.created_at), 'dd.MM.yyyy HH:mm:ss'),
        activity.profile?.full_name || 'Bilinmiyor',
        activity.profile?.email || 'Bilinmiyor',
        activity.profile?.role || 'Bilinmiyor',
        activityLabels[activity.activity_type as keyof typeof activityLabels] || activity.activity_type,
        resourceLabels[activity.resource_type as keyof typeof resourceLabels] || activity.resource_type,
        activity.ip_address || '',
        JSON.stringify(activity.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aktivite-loglari-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ip_address?.includes(searchTerm);
    
    const matchesActivity = activityFilter === 'all' || activity.activity_type === activityFilter;
    const matchesResource = resourceFilter === 'all' || activity.resource_type === resourceFilter;

    let matchesDate = true;
    if (dateRange !== 'all') {
      const activityDate = new Date(activity.created_at);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          matchesDate = activityDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = activityDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = activityDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesActivity && matchesResource && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Aktivite Logları
        </h1>
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchActivities} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          Sistemde gerçekleştirilen tüm kullanıcı aktivitelerini buradan takip edebilirsiniz. 
          Loglar gerçek zamanlı olarak güncellenir.
        </AlertDescription>
      </Alert>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kullanıcı adı, email veya IP ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Aktivite türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Aktiviteler</SelectItem>
                <SelectItem value="login">Giriş/Çıkış</SelectItem>
                <SelectItem value="create_product">Ürün İşlemleri</SelectItem>
                <SelectItem value="create_order">Sipariş İşlemleri</SelectItem>
                <SelectItem value="role_change">Rol İşlemleri</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kaynak türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                <SelectItem value="product">Ürünler</SelectItem>
                <SelectItem value="order">Siparişler</SelectItem>
                <SelectItem value="user">Kullanıcılar</SelectItem>
                <SelectItem value="session">Oturumlar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Tarih aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Son 7 Gün</SelectItem>
                <SelectItem value="month">Son 30 Gün</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchActivities} className="w-full">
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aktivite Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Aktiviteler ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih/Saat</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Aktivite</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Detaylar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const IconComponent = activityIcons[activity.activity_type as keyof typeof activityIcons] || Activity;
                    
                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(activity.created_at), 'dd MMM yyyy', { locale: tr })}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(activity.created_at), 'HH:mm:ss', { locale: tr })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{activity.profile?.full_name}</div>
                            <div className="text-sm text-gray-500">{activity.profile?.email}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {activity.profile?.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span className="font-medium">
                              {activityLabels[activity.activity_type as keyof typeof activityLabels] || activity.activity_type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {resourceLabels[activity.resource_type as keyof typeof resourceLabels] || activity.resource_type}
                          </Badge>
                          {activity.resource_id && (
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {activity.resource_id.substring(0, 8)}...
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {activity.ip_address}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedLog(activity);
                              setDetailDialogOpen(true);
                            }}
                          >
                            Görüntüle
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aktivite bulunamadı</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detay Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aktivite Detayları</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Kullanıcı</Label>
                  <p>{selectedLog.profile?.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedLog.profile?.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Tarih/Saat</Label>
                  <p>{format(new Date(selectedLog.created_at), 'dd MMMM yyyy HH:mm:ss', { locale: tr })}</p>
                </div>
                <div>
                  <Label className="font-medium">Aktivite</Label>
                  <p>{activityLabels[selectedLog.activity_type as keyof typeof activityLabels]}</p>
                </div>
                <div>
                  <Label className="font-medium">Kaynak</Label>
                  <p>{resourceLabels[selectedLog.resource_type as keyof typeof resourceLabels]}</p>
                </div>
                <div>
                  <Label className="font-medium">IP Adresi</Label>
                  <p>{selectedLog.ip_address}</p>
                </div>
                <div>
                  <Label className="font-medium">Session ID</Label>
                  <p className="text-xs font-mono">{selectedLog.session_id}</p>
                </div>
              </div>
              
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="font-medium">Aktivite Detayları</Label>
                  <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <Label className="font-medium">User Agent</Label>
                <p className="text-sm text-gray-600 break-all">{selectedLog.user_agent}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className || ''}`}>{children}</label>;
}
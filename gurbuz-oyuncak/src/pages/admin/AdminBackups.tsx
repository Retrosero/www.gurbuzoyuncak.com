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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Play,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BackupSchedule {
  id: number;
  table_name: string;
  frequency: string;
  last_backup: string;
  next_backup: string;
  is_active: boolean;
  backup_path: string;
  created_by: string;
  created_at: string;
  profile?: {
    full_name: string;
  };
}

interface DatabaseTable {
  table_name: string;
  table_schema: string;
}

const frequencyLabels = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık'
};

const frequencyColors = {
  daily: 'bg-green-100 text-green-800',
  weekly: 'bg-green-100 text-green-800',
  monthly: 'bg-purple-100 text-purple-800'
};

export default function AdminBackups() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<BackupSchedule[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    completed_today: 0,
    next_backup: null as string | null
  });

  useEffect(() => {
    fetchBackups();
    fetchTables();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('backup_schedules')
        .select(`
          *,
          profile:profiles!backup_schedules_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const backupData = data || [];
      setBackups(backupData);
      
      // Metrikleri hesapla
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeBackups = backupData.filter(b => b.is_active);
      const todayBackups = backupData.filter(b => 
        b.last_backup && new Date(b.last_backup) >= today
      );
      
      const nextBackups = activeBackups
        .filter(b => b.next_backup)
        .sort((a, b) => new Date(a.next_backup!).getTime() - new Date(b.next_backup!).getTime());

      setMetrics({
        total: backupData.length,
        active: activeBackups.length,
        completed_today: todayBackups.length,
        next_backup: nextBackups.length > 0 ? nextBackups[0].next_backup : null
      });

    } catch (error) {
      console.error('Yedekleme planları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      // Supabase'den tabloları al (mümkünse)
      // Bu demo için sabit liste kullanıyoruz
      const systemTables = [
        'profiles',
        'products', 
        'categories',
        'orders',
        'order_items',
        'coupons',
        'brands',
        'campaigns',
        'loyalty_rewards',
        'balance_transactions'
      ];
      
      setTables(systemTables.map(name => ({ table_name: name, table_schema: 'public' })));
    } catch (error) {
      console.error('Tablolar yüklenirken hata:', error);
    }
  };

  const createBackup = async (tableName: string) => {
    try {
      setBackupLoading(tableName);
      
      const { data, error } = await supabase.functions.invoke('backup-manager', {
        body: {
          table_name: tableName,
          backup_path: `backup_${tableName}_${Date.now()}`
        }
      });

      if (error) throw error;

      await fetchBackups();
      alert(`${tableName} tablosu için yedekleme başlatıldı.`);
      
    } catch (error) {
      console.error('Yedekleme başlatılırken hata:', error);
      alert('Yedekleme başlatılırken hata oluştu.');
    } finally {
      setBackupLoading(null);
    }
  };

  const createSchedule = async () => {
    try {
      if (!selectedTable) {
        alert('Lütfen bir tablo seçin.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('backup-manager', {
        body: {
          action: 'schedule',
          table_name: selectedTable,
          frequency: selectedFrequency,
          created_by: user?.id
        }
      });

      if (error) throw error;

      await fetchBackups();
      setScheduleDialogOpen(false);
      setSelectedTable('');
      setSelectedFrequency('daily');
      
    } catch (error) {
      console.error('Yedekleme planı oluşturulurken hata:', error);
      alert('Yedekleme planı oluşturulurken hata oluştu.');
    }
  };

  const toggleSchedule = async (scheduleId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('backup_schedules')
        .update({ is_active: !isActive })
        .eq('id', scheduleId);

      if (error) throw error;

      await fetchBackups();
    } catch (error) {
      console.error('Yedekleme planı güncellenirken hata:', error);
    }
  };

  const getBackupStatus = (schedule: BackupSchedule) => {
    if (!schedule.is_active) return { status: 'inactive', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    
    if (!schedule.next_backup) return { status: 'not_scheduled', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    
    const nextBackup = new Date(schedule.next_backup);
    const now = new Date();
    
    if (nextBackup < now) {
      return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else {
      return { status: 'scheduled', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const isOverdue = (backup: BackupSchedule) => {
    return backup.next_backup && new Date(backup.next_backup) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="w-6 h-6" />
          Yedekleme Yönetimi
        </h1>
        <div className="flex gap-2">
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yedekleme Planı Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="table">Tablo Seçin</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tablo seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.table_name} value={table.table_name}>
                          {table.table_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Frekans</Label>
                  <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={createSchedule}>
                    Oluştur
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={fetchBackups} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Veritabanı yedeklemelerini buradan yönetebilirsiniz. Otomatik yedekleme planları oluşturabilir 
          ve manuel yedekleme başlatabilirsiniz.
        </AlertDescription>
      </Alert>

      {/* Yedekleme Metrikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Plan</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktif Plan</p>
                <p className="text-2xl font-bold">{metrics.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Bugün Tamamlanan</p>
                <p className="text-2xl font-bold">{metrics.completed_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Sonraki Yedekleme</p>
                <p className="text-sm font-medium">
                  {metrics.next_backup 
                    ? formatDistanceToNow(new Date(metrics.next_backup), { addSuffix: true, locale: tr })
                    : 'Planlanmamış'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yedekleme Tabloları */}
      <Card>
        <CardHeader>
          <CardTitle>Yedekleme Planları</CardTitle>
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
                    <TableHead>Tablo</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Frekans</TableHead>
                    <TableHead>Son Yedekleme</TableHead>
                    <TableHead>Sonraki Yedekleme</TableHead>
                    <TableHead>Oluşturan</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => {
                    const status = getBackupStatus(backup);
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={backup.id} className={isOverdue(backup) ? 'bg-red-50' : ''}>
                        <TableCell>
                          <div className="font-medium">{backup.table_name}</div>
                          {backup.backup_path && (
                            <div className="text-sm text-gray-500">{backup.backup_path}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {backup.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={frequencyColors[backup.frequency as keyof typeof frequencyColors]}>
                            {frequencyLabels[backup.frequency as keyof typeof frequencyLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {backup.last_backup ? (
                            <div>
                              <div className="text-sm">
                                {format(new Date(backup.last_backup), 'dd MMM yyyy', { locale: tr })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(backup.last_backup), 'HH:mm', { locale: tr })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Henüz yok</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {backup.next_backup ? (
                            <div className={isOverdue(backup) ? 'text-red-600 font-medium' : ''}>
                              <div className="text-sm">
                                {format(new Date(backup.next_backup), 'dd MMM yyyy', { locale: tr })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(backup.next_backup), 'HH:mm', { locale: tr })}
                              </div>
                              {isOverdue(backup) && (
                                <div className="text-xs text-red-600 font-medium">
                                  Gecikmiş
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Planlanmamış</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{backup.profile?.full_name || 'Bilinmiyor'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => createBackup(backup.table_name)}
                              disabled={backupLoading === backup.table_name}
                            >
                              {backupLoading === backup.table_name ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={backup.is_active ? "destructive" : "default"}
                              onClick={() => toggleSchedule(backup.id, backup.is_active)}
                            >
                              {backup.is_active ? 'Duraklat' : 'Başlat'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {backups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Yedekleme planı bulunamadı</p>
                  <Button 
                    onClick={() => setScheduleDialogOpen(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    İlk Planı Oluştur
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manuel Yedekleme Bölümü */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Manuel Yedekleme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tables.slice(0, 10).map((table) => (
              <Button
                key={table.table_name}
                variant="outline"
                onClick={() => createBackup(table.table_name)}
                disabled={backupLoading === table.table_name}
                className="h-20 flex flex-col"
              >
                {backupLoading === table.table_name ? (
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                ) : (
                  <Database className="w-6 h-6 mb-2" />
                )}
                <span className="text-sm">{table.table_name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
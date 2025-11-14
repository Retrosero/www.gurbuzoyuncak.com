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
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SecurityLog {
  id: number;
  user_id: string;
  event_type: string;
  severity: string;
  ip_address: string;
  user_agent: string;
  details: any;
  resolved: boolean;
  resolved_by: string;
  resolved_at: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

const severityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
};

const eventLabels = {
  failed_login: 'Başarısız Giriş',
  suspicious_activity: 'Şüpheli Aktivite',
  account_locked: 'Hesap Kilitlendi',
  password_reset: 'Şifre Sıfırlama',
  multiple_logins: 'Çoklu Giriş Denemesi',
  brute_force: 'Brute Force Saldırısı',
  unauthorized_access: 'Yetkisiz Erişim'
};

export default function AdminSecurityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_logs')
        .select(`
          *,
          profile:profiles!security_logs_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Güvenlik logları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveLog = async (logId: number) => {
    try {
      setResolving(logId);
      
      const { error } = await supabase
        .from('security_logs')
        .update({ 
          resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', logId);

      if (error) throw error;

      await fetchSecurityLogs();
    } catch (error) {
      console.error('Güvenlik olayı çözülürken hata:', error);
    } finally {
      setResolving(null);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Tarih', 'Kullanıcı', 'Email', 'Olay Türü', 'Önem Seviyesi', 'IP', 'Durum', 'Detaylar'],
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss'),
        log.profile?.full_name || 'Bilinmiyor',
        log.profile?.email || 'Bilinmiyor',
        eventLabels[log.event_type as keyof typeof eventLabels] || log.event_type,
        log.severity.toUpperCase(),
        log.ip_address || '',
        log.resolved ? 'Çözüldü' : 'Beklemede',
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guvenlik-loglari-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSecurityMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayLogs = logs.filter(log => new Date(log.created_at) >= today);
    const weekLogs = logs.filter(log => new Date(log.created_at) >= last7Days);
    const criticalLogs = logs.filter(log => log.severity === 'critical' && !log.resolved);
    
    return {
      today: todayLogs.length,
      week: weekLogs.length,
      critical: criticalLogs.length,
      unresolved: logs.filter(log => !log.resolved).length
    };
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm);
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesEvent = eventFilter === 'all' || log.event_type === eventFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'resolved' && log.resolved) ||
      (statusFilter === 'unresolved' && !log.resolved);

    return matchesSearch && matchesSeverity && matchesEvent && matchesStatus;
  });

  const metrics = getSecurityMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Güvenlik Logları
        </h1>
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchSecurityLogs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sistem güvenliği ile ilgili tüm olayları buradan takip edebilirsiniz. 
          Kritik olaylar hemen müdahale gerektirir.
        </AlertDescription>
      </Alert>

      {/* Güvenlik Metrikleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Bugün</p>
                <p className="text-2xl font-bold">{metrics.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Son 7 Gün</p>
                <p className="text-2xl font-bold">{metrics.week}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Kritik Olaylar</p>
                <p className="text-2xl font-bold">{metrics.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold">{metrics.unresolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Önem seviyesi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Seviyeler</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Olay türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Olaylar</SelectItem>
                <SelectItem value="failed_login">Başarısız Giriş</SelectItem>
                <SelectItem value="suspicious_activity">Şüpheli Aktivite</SelectItem>
                <SelectItem value="account_locked">Hesap Kilitlendi</SelectItem>
                <SelectItem value="password_reset">Şifre Sıfırlama</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="unresolved">Beklemede</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchSecurityLogs} className="w-full">
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Güvenlik Logları Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik Olayları ({filteredLogs.length})</CardTitle>
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
                    <TableHead>Önem</TableHead>
                    <TableHead>Tarih/Saat</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Olay</TableHead>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const config = severityConfig[log.severity as keyof typeof severityConfig];
                    const IconComponent = config.icon;
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={config.color}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {log.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(log.created_at), 'dd MMM yyyy', { locale: tr })}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(log.created_at), 'HH:mm:ss', { locale: tr })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.profile?.full_name || 'Bilinmiyor'}</div>
                            <div className="text-sm text-gray-500">{log.profile?.email || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {eventLabels[log.event_type as keyof typeof eventLabels] || log.event_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {log.ip_address}
                          </code>
                        </TableCell>
                        <TableCell>
                          {log.resolved ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Çözüldü
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <Clock className="w-3 h-3 mr-1" />
                              Beklemede
                            </Badge>
                          )}
                          {log.resolved && log.resolved_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(log.resolved_at), 'dd.MM HH:mm', { locale: tr })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedLog(log);
                                setDetailDialogOpen(true);
                              }}
                            >
                              Detay
                            </Button>
                            {!log.resolved && (
                              <Button 
                                size="sm" 
                                onClick={() => resolveLog(log.id)}
                                disabled={resolving === log.id}
                              >
                                {resolving === log.id ? 'Çözülüyor...' : 'Çöz'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Güvenlik olayı bulunamadı</p>
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
            <DialogTitle>Güvenlik Olayı Detayları</DialogTitle>
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
                  <Label className="font-medium">Olay Türü</Label>
                  <p>{eventLabels[selectedLog.event_type as keyof typeof eventLabels]}</p>
                </div>
                <div>
                  <Label className="font-medium">Önem Seviyesi</Label>
                  <Badge className={severityConfig[selectedLog.severity as keyof typeof severityConfig].color}>
                    {selectedLog.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">IP Adresi</Label>
                  <p>{selectedLog.ip_address}</p>
                </div>
                <div>
                  <Label className="font-medium">Durum</Label>
                  <p>{selectedLog.resolved ? 'Çözüldü' : 'Beklemede'}</p>
                </div>
              </div>
              
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="font-medium">Olay Detayları</Label>
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
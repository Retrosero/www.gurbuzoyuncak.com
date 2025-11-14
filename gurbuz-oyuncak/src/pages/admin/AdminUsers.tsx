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
  Users, 
  Shield, 
  Search, 
  Eye, 
  Edit, 
  Lock, 
  Unlock,
  UserCheck,
  UserX
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  customer_type: string;
  is_active: boolean;
  last_login: string;
  failed_login_attempts: number;
  account_locked_until: string;
  created_at: string;
  balance: number;
  loyalty_points: number;
}

const roleLabels = {
  admin: 'Yönetici',
  moderator: 'Moderatör', 
  editor: 'Editör',
  bayi: 'Bayi',
  user: 'Kullanıcı'
};

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  moderator: 'bg-green-100 text-green-800',
  editor: 'bg-green-100 text-green-800', 
  bayi: 'bg-purple-100 text-purple-800',
  user: 'bg-gray-100 text-gray-800'
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, role: string) => {
    try {
      setUpdating(true);
      
      // Rol güncelle
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ 
          role, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Aktivite logla
      await supabase.functions.invoke('activity-logger', {
        body: {
          user_id: userId,
          activity_type: 'role_change',
          resource_type: 'user',
          resource_id: userId,
          details: { 
            new_role: role, 
            updated_by: user?.id 
          }
        }
      });

      await fetchUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Rol güncellenirken hata:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Aktivite logla
      await supabase.functions.invoke('activity-logger', {
        body: {
          user_id: userId,
          activity_type: 'status_change',
          resource_type: 'user',
          resource_id: userId,
          details: { 
            new_status: !isActive, 
            changed_by: user?.id 
          }
        }
      });

      await fetchUsers();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active) ||
                         (statusFilter === 'locked' && user.account_locked_until);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const isAccountLocked = (user: UserProfile) => {
    return user.account_locked_until && 
           new Date(user.account_locked_until) > new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Kullanıcı Yönetimi
        </h1>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Kullanıcı rollerini ve durumlarını buradan yönetebilirsiniz. 
          Rol değişiklikleri hemen geçerli olur.
        </AlertDescription>
      </Alert>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ad, email veya telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="admin">Yönetici</SelectItem>
                <SelectItem value="moderator">Moderatör</SelectItem>
                <SelectItem value="editor">Editör</SelectItem>
                <SelectItem value="bayi">Bayi</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="locked">Kilitli</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchUsers} variant="outline">
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({filteredUsers.length})</CardTitle>
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
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Son Giriş</TableHead>
                    <TableHead>Bakiye</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{userData.full_name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                          <div className="text-xs text-gray-400">{userData.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[userData.role as keyof typeof roleColors]}>
                          {roleLabels[userData.role as keyof typeof roleLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {isAccountLocked(userData) ? (
                            <Badge variant="destructive">
                              <Lock className="w-3 h-3 mr-1" />
                              Kilitli
                            </Badge>
                          ) : userData.is_active ? (
                            <Badge variant="default">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <UserX className="w-3 h-3 mr-1" />
                              Pasif
                            </Badge>
                          )}
                          {userData.failed_login_attempts > 0 && (
                            <span className="text-xs text-orange-600">
                              {userData.failed_login_attempts} başarısız deneme
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {userData.last_login ? 
                          format(new Date(userData.last_login), 'dd MMM yyyy HH:mm', { locale: tr }) : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {userData.balance ? `${userData.balance}₺` : '0₺'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(userData.created_at), 'dd MMM yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(userData);
                                  setNewRole(userData.role);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div>
                                    <Label>Kullanıcı</Label>
                                    <p className="text-sm font-medium">{selectedUser.full_name}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="role">Rol</Label>
                                    <Select value={newRole} onValueChange={setNewRole}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Yönetici</SelectItem>
                                        <SelectItem value="moderator">Moderatör</SelectItem>
                                        <SelectItem value="editor">Editör</SelectItem>
                                        <SelectItem value="bayi">Bayi</SelectItem>
                                        <SelectItem value="user">Kullanıcı</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setEditDialogOpen(false)}
                                    >
                                      İptal
                                    </Button>
                                    <Button 
                                      onClick={() => handleRoleUpdate(selectedUser.user_id, newRole)}
                                      disabled={updating || selectedUser.role === newRole}
                                    >
                                      {updating ? 'Güncelleniyor...' : 'Güncelle'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button 
                            size="sm" 
                            variant={userData.is_active ? "destructive" : "default"}
                            onClick={() => handleToggleStatus(userData.user_id, userData.is_active)}
                          >
                            {userData.is_active ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Kullanıcı bulunamadı</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
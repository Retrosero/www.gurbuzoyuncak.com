import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  Settings, 
  CheckCircle,
  XCircle,
  Eye,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  [key: string]: boolean;
}

interface Role {
  name: string;
  description: string;
  permissions: Permission;
  user_count: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  moderator: 'bg-green-100 text-green-800',
  editor: 'bg-green-100 text-green-800', 
  bayi: 'bg-purple-100 text-purple-800',
  user: 'bg-gray-100 text-gray-800'
};

const permissionDescriptions = {
  can_manage_users: 'Kullanıcı Yönetimi',
  can_manage_roles: 'Rol Yönetimi',
  can_view_logs: 'Log Görüntüleme',
  can_manage_products: 'Ürün Yönetimi',
  can_manage_orders: 'Sipariş Yönetimi',
  can_manage_backups: 'Yedekleme Yönetimi',
  can_access_all_sections: 'Tüm Bölümlere Erişim'
};

export default function AdminRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
    fetchRoleDistribution();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('role-manager', {
        body: { action: 'permissions' }
      });

      if (error) throw error;

      setRoles(data.data);
    } catch (error) {
      console.error('Roller yüklenirken hata:', error);
    }
  };

  const fetchRoleDistribution = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .order('role');

      if (error) throw error;

      const roleCounts: Record<string, number> = {};
      data?.forEach(profile => {
        roleCounts[profile.role] = (roleCounts[profile.role] || 0) + 1;
      });

      const total = data?.length || 0;
      const distribution: RoleDistribution[] = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      setRoleDistribution(distribution);
    } catch (error) {
      console.error('Rol dağılımı yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'moderator':
        return <Settings className="w-5 h-5 text-green-600" />;
      case 'editor':
        return <Eye className="w-5 h-5 text-green-600" />;
      case 'bayi':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Rol Yönetimi
        </h1>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sistem rollerini ve izinlerini buradan yönetebilirsiniz. Her rolün belirli yetkileri vardır 
          ve kullanıcılara uygun roller atanmalıdır.
        </AlertDescription>
      </Alert>

      {/* Rol Dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Rol Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {roleDistribution.map((item) => (
                <Card key={item.role} className="border-2">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {getRoleIcon(item.role)}
                      </div>
                      <div className="text-2xl font-bold">{item.count}</div>
                      <div className="text-sm text-gray-600 capitalize">{item.role}</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rol Detayları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(roles).map(([roleName, role]) => (
          <Card key={roleName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${roleColors[roleName as keyof typeof roleColors]}`}>
                  {getRoleIcon(roleName)}
                </div>
                <div>
                  <div className="capitalize">{roleName}</div>
                  <div className="text-sm text-gray-500 font-normal">{role.description}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(role.permissions).map(([permission, hasPermission]) => {
                  const PermissionIcon = hasPermission ? CheckCircle : XCircle;
                  const IconColor = hasPermission ? 'text-green-600' : 'text-gray-400';
                  
                  return (
                    <div key={permission} className="flex items-center gap-3">
                      <PermissionIcon className={`w-4 h-4 ${IconColor}`} />
                      <span className={`text-sm ${hasPermission ? 'text-gray-900' : 'text-gray-500'}`}>
                        {permissionDescriptions[permission as keyof typeof permissionDescriptions]}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Toplam Kullanıcı: {role.user_count}
                  </span>
                  <Badge className={roleColors[roleName as keyof typeof roleColors]}>
                    {roleName.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rol Açıklamaları */}
      <Card>
        <CardHeader>
          <CardTitle>Rol Açıklamaları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">Yönetici (Admin)</h4>
              <p className="text-sm text-gray-600">
                Sistemdeki tüm yetkilere sahiptir. Kullanıcı yönetimi, sistem ayarları ve 
                tüm veritabanı işlemlerini gerçekleştirebilir. Bu rol sadece güvenilir kişilere verilmelidir.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Moderatör</h4>
              <p className="text-sm text-gray-600">
                Ürün ve kategori yönetimi, sipariş takibi ve temel sistem yönetimi işlemlerini 
                yapabilir. Kullanıcı yönetimi yetkisi yoktur.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Editör</h4>
              <p className="text-sm text-gray-600">
                Ürün bilgilerini düzenleyebilir, içerik oluşturabilir ve güncelleyebilir. 
                Sistem ayarlarına erişimi yoktur.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Bayi</h4>
              <p className="text-sm text-gray-600">
                Bayi panelinden siparişlerini takip edebilir, kendi ürünlerini görüntüleyebilir 
                ve fatura bilgilerini güncelleyebilir.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-600 mb-2">Kullanıcı</h4>
              <p className="text-sm text-gray-600">
                Normal müşteri hesabı. Ürün satın alabilir, profil bilgilerini güncelleyebilir 
                ve siparişlerini takip edebilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Güvenlik Uyarıları */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Güvenlik Uyarıları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Yönetici Rolü</p>
                <p className="text-sm text-orange-700">
                  Yönetici rolü sadece güvenilir kişilere verilmelidir. Bu rol tüm sistem 
                  verilerine erişim sağlar ve sistem güvenliğini etkiler.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Rol Değişiklikleri</p>
                <p className="text-sm text-orange-700">
                  Rol değişiklikleri otomatik olarak loglanır ve geri alınabilir. 
                  Her değişiklik kullanıcı tarafından yapılır ve kayıt altına alınır.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">İzin Yönetimi</p>
                <p className="text-sm text-orange-700">
                  Kullanıcılar sadece rolüne uygun işlemleri gerçekleştirebilir. 
                  Yetkisiz işlemler engellenir ve loglanır.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  template_id?: number;
  subject: string;
  sent_at?: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  retry_count: number;
  metadata?: any;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  product_id: number;
  old_price: number;
  new_price: number;
  alert_sent: boolean;
  notification_sent_at?: string;
  created_at: string;
  products?: {
    name: string;
    image_url?: string;
    price: number;
  };
  profiles?: {
    email: string;
    first_name?: string;
  };
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('notification_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notification_history')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Bildirim okundu olarak işaretlenemedi:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notification_history')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Tüm bildirimler okundu olarak işaretlenemedi:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notification_history')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Bildirim silinemedi:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
    unreadCount: notifications.filter(n => !n.is_read).length
  };
};

export const useEmailLogs = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setEmailLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email logları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const retryEmail = async (emailId: string) => {
    try {
      // Email retry logic will be implemented
      console.log('Email retry:', emailId);
    } catch (err) {
      console.error('Email retry başarısız:', err);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  return {
    emailLogs,
    loading,
    error,
    retryEmail,
    refetch: fetchEmailLogs,
    sentCount: emailLogs.filter(log => log.status === 'sent').length,
    failedCount: emailLogs.filter(log => log.status === 'failed').length,
    pendingCount: emailLogs.filter(log => log.status === 'pending').length
  };
};

export const usePriceAlerts = (userId?: string) => {
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceAlerts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('price_alerts')
        .select('*, products(name, image_url, price), profiles(email, first_name)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPriceAlerts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fiyat uyarıları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const createPriceAlert = async (productId: number, userId: string) => {
    try {
      // Önce ürünün mevcut fiyatını al
      const { data: product } = await supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Ürün bulunamadı');

      const { error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: userId,
          product_id: productId,
          old_price: product.price,
          new_price: product.price // Başlangıçta aynı fiyat
        });

      if (error) throw error;

      await fetchPriceAlerts();
    } catch (err) {
      console.error('Fiyat uyarısı oluşturulamadı:', err);
      throw err;
    }
  };

  const deletePriceAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Fiyat uyarısı silinemedi:', err);
    }
  };

  useEffect(() => {
    fetchPriceAlerts();
  }, [userId]);

  return {
    priceAlerts,
    loading,
    error,
    createPriceAlert,
    deletePriceAlert,
    refetch: fetchPriceAlerts,
    activeAlerts: priceAlerts.filter(alert => !alert.alert_sent).length
  };
};

export const useNotificationSettings = (userId?: string) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setSettings(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: any) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err) {
      console.error('Ayarlar güncellenemedi:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};
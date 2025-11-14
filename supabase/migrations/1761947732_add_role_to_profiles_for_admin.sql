-- Migration: add_role_to_profiles_for_admin
-- Created at: 1761947732

-- profiles tablosuna role alanı ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Varsayılan admin kullanıcıları oluştur (email kontrolü ile)
-- Bu alanı manuel olarak ayarlamak gerekecek

-- RLS policies güncelle
DROP POLICY IF EXISTS "Admin'lar tüm scheduled task'ları yönetebilir" ON xml_scheduled_tasks;

CREATE POLICY "Admin'lar tüm scheduled task'ları yönetebilir"
    ON xml_scheduled_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );;
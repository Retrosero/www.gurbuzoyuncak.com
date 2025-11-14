-- Migration: add_security_tables_rls_policies
-- Created at: 1761977396

-- RLS Politikaları (sadece yeni tablolar için)
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcılar tüm logları görebilir
CREATE POLICY "Admins can view all activities" ON user_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

CREATE POLICY "Admins can view security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

-- Kullanıcılar kendi aktivitelerini görebilir
CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (user_id = auth.uid());

-- Sistem adminleri tüm tabloları yönetebilir
CREATE POLICY "System admins can manage everything" ON user_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

CREATE POLICY "System admins can manage security logs" ON security_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

-- Moderatörler de güvenlik loglarını görebilir
CREATE POLICY "Moderators can view security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Her kullanıcı kendi sessionlarını görebilir
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Adminler tüm sessionları görebilir
CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

-- Backup schedules için admin yetkisi
CREATE POLICY "Admins can manage backup schedules" ON backup_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );;
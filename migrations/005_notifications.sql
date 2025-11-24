-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'task_assigned', 'task_completed', 'comment_added', 'mention', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500), -- URL to navigate to
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB -- Extra data like task_id, project_id, etc.
);

-- Indexes for fast queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Activity log table (for activity feed)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'task_created', 'task_updated', 'task_deleted', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'project', 'comment', etc.
    entity_id UUID,
    description TEXT NOT NULL,
    metadata JSONB, -- Extra context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX idx_activity_log_org_id ON activity_log(organization_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_task_assigned BOOLEAN DEFAULT TRUE,
    email_task_completed BOOLEAN DEFAULT TRUE,
    email_mentions BOOLEAN DEFAULT TRUE,
    email_comments BOOLEAN DEFAULT TRUE,
    in_app_task_assigned BOOLEAN DEFAULT TRUE,
    in_app_task_completed BOOLEAN DEFAULT TRUE,
    in_app_mentions BOOLEAN DEFAULT TRUE,
    in_app_comments BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
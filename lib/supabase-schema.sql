-- Run this in your Supabase SQL Editor to set up the database

-- Members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_number VARCHAR(10) NOT NULL UNIQUE,
  owner_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices table
CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  notice_type VARCHAR(20) NOT NULL CHECK (notice_type IN ('agm', 'general')),
  attachment_url TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which members have read which notices
CREATE TABLE notice_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notice_id, member_id)
);

-- Sessions table for login tokens
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policies: allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access" ON members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notices FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notice_reads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON sessions FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_notices_type ON notices(notice_type);
CREATE INDEX idx_notices_created ON notices(created_at DESC);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Insert admin member (change password after first login)
-- Default password: Admin@123 (bcrypt hash)
INSERT INTO members (flat_number, owner_name, email, is_admin, password_hash)
VALUES ('ADMIN', 'Society Admin', 'admin@ravirajspring.com', TRUE,
  '$2a$10$rQdE3kV0vN8wJ5sX9yZ1UOkH7mP4nL6tR2wY8vB3cA5xK9jF1hG2i');

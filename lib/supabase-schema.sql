-- Run this in your Supabase SQL Editor to set up the database

-- Members table
CREATE TABLE IF NOT EXISTS members (
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
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  notice_type VARCHAR(20) NOT NULL CHECK (notice_type IN ('agm', 'general')),
  attachment_url TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notice attachments (multiple files per notice)
CREATE TABLE IF NOT EXISTS notice_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which members have read which notices
CREATE TABLE IF NOT EXISTS notice_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notice_id, member_id)
);

-- Sessions table for login tokens
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guidelines documents (public)
CREATE TABLE IF NOT EXISTS guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standard forms (public)
CREATE TABLE IF NOT EXISTS standard_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Managing Committee members (public)
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(150),
  flat_number VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Policies: allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access" ON members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notices FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notice_attachments FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notice_reads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON sessions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON guidelines FOR ALL USING (true);
CREATE POLICY "Service role full access" ON standard_forms FOR ALL USING (true);
CREATE POLICY "Service role full access" ON committee_members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON password_resets FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notices_type ON notices(notice_type);
CREATE INDEX IF NOT EXISTS idx_notices_created ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_notice_attachments_notice ON notice_attachments(notice_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_order ON guidelines(display_order);
CREATE INDEX IF NOT EXISTS idx_standard_forms_order ON standard_forms(display_order);
CREATE INDEX IF NOT EXISTS idx_committee_order ON committee_members(display_order);

-- Insert admin member (change password after first login)
-- Default password: Admin@123 (bcrypt hash)
INSERT INTO members (flat_number, owner_name, email, is_admin, password_hash)
VALUES ('ADMIN', 'Society Admin', 'admin@ravirajspring.com', TRUE,
  '$2a$10$k.3IfRnjQndooDLyOmwiPuPcle2pM1oJDuF7ersZdkVJcJrqZRCbu')
ON CONFLICT (flat_number) DO NOTHING;

-- Phase 2 Migration: Run this in Supabase SQL Editor
-- New tables for notice attachments, guidelines, forms, committee, password resets

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

-- Make notices.content nullable (for file-only notices)
ALTER TABLE notices ALTER COLUMN content DROP NOT NULL;

-- Enable Row Level Security on new tables
ALTER TABLE notice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Policies: allow service role full access
CREATE POLICY "Service role full access" ON notice_attachments FOR ALL USING (true);
CREATE POLICY "Service role full access" ON guidelines FOR ALL USING (true);
CREATE POLICY "Service role full access" ON standard_forms FOR ALL USING (true);
CREATE POLICY "Service role full access" ON committee_members FOR ALL USING (true);
CREATE POLICY "Service role full access" ON password_resets FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notice_attachments_notice ON notice_attachments(notice_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_order ON guidelines(display_order);
CREATE INDEX IF NOT EXISTS idx_standard_forms_order ON standard_forms(display_order);
CREATE INDEX IF NOT EXISTS idx_committee_order ON committee_members(display_order);

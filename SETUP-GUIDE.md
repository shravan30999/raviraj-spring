# Raviraj Spring Society Portal — Setup Guide

This guide will take you from zero to a live website at www.ravirajspring.com.
You need about 30-40 minutes and a laptop/PC.

---

## Step 1: Create Free Accounts (10 minutes)

### 1A. Supabase (Database + User Storage)
1. Go to https://supabase.com and click "Start your project"
2. Sign up with your Google or GitHub account
3. Click "New project"
4. Name it: `raviraj-spring`
5. Set a database password (save it somewhere safe)
6. Region: choose "South Asia (Mumbai)" if available, otherwise Singapore
7. Wait 2 minutes for it to set up
8. Once ready, go to **Settings > API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### 1B. Set Up Database Tables
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy-paste the ENTIRE content of the file `lib/supabase-schema.sql` from this project
4. Click "Run"
5. You should see "Success" — this creates all the tables and the admin account

### 1C. Resend (Email Notifications)
1. Go to https://resend.com and sign up
2. Go to **API Keys** and create a new key
3. Copy it → this is your `RESEND_API_KEY`
4. For now, emails will come from `onboarding@resend.dev` (Resend's default)
5. Later, you can add your own domain to send from `notices@ravirajspring.com`

### 1D. GitHub Account
1. Go to https://github.com and sign up (if you don't have one)
2. This is needed to deploy on Vercel

### 1E. Vercel (Free Hosting)
1. Go to https://vercel.com and sign up with your GitHub account

---

## Step 2: Upload Code to GitHub (5 minutes)

1. Go to https://github.com/new
2. Repository name: `raviraj-spring`
3. Keep it Private
4. Click "Create repository"
5. Upload all the files from this project folder to the repository
   - Easiest way: drag and drop all files on the GitHub page
   - OR use the "Upload files" button

---

## Step 3: Deploy on Vercel (10 minutes)

1. Go to https://vercel.com/new
2. Click "Import" next to your `raviraj-spring` GitHub repository
3. Before clicking Deploy, click **"Environment Variables"** and add these:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `RESEND_API_KEY` | Your Resend API key |
| `NEXT_PUBLIC_APP_URL` | `https://www.ravirajspring.com` |

4. Click **Deploy**
5. Wait 2-3 minutes. Vercel will give you a URL like `raviraj-spring.vercel.app`
6. Test it — you should see the login page!

---

## Step 4: Connect Your Domain (10 minutes)

1. In Vercel, go to your project > **Settings > Domains**
2. Type `www.ravirajspring.com` and click Add
3. Vercel will show you DNS records to add. You need to add a **CNAME record**:
   - Type: CNAME
   - Name: www
   - Value: `cname.vercel-dns.com`
4. Also add for the root domain `ravirajspring.com`:
   - Type: A
   - Value: `76.76.21.21`

### In Spaceship:
1. Log in to spaceship.com
2. Go to Domains > ravirajspring.com > DNS Records
3. Add the CNAME and A records above
4. Wait 1-24 hours for DNS to propagate
5. Vercel will automatically set up the free SSL certificate

---

## Step 5: Set Up Admin Login

The database setup creates a default admin account:
- Flat Number: `ADMIN`
- Password: You need to set this manually

### Set Admin Password:
1. Go to Supabase > SQL Editor
2. Run this (replace `YourSecurePassword` with your actual password):

```sql
-- First, generate a password hash. Go to https://bcrypt-generator.com/
-- Enter your desired password, click Generate, copy the hash
-- Then run:
UPDATE members 
SET password_hash = 'PASTE_YOUR_BCRYPT_HASH_HERE' 
WHERE flat_number = 'ADMIN';
```

Or simpler — delete the auto-created admin and add one through the app:
```sql
DELETE FROM members WHERE flat_number = 'ADMIN';
INSERT INTO members (flat_number, owner_name, email, is_admin, password_hash)
VALUES ('ADMIN', 'Society Secretary', 'your-email@gmail.com', TRUE,
  '$2a$10$YOUR_BCRYPT_HASH_HERE');
```

---

## Step 6: Add Your 97 Members

### Option A: One by one (through admin panel)
1. Login at ravirajspring.com with the ADMIN account
2. Go to Members tab
3. Click "+ Add Member" and fill in each member's details

### Option B: Bulk import (faster)
1. Prepare an Excel/CSV with columns: flat_number, owner_name, email, phone
2. In Supabase > SQL Editor, run INSERT statements. Example:

```sql
-- Replace the hash with a bcrypt hash of the default password you want
-- You can use the same default password for all and ask members to contact you to change it

INSERT INTO members (flat_number, owner_name, email, phone, password_hash) VALUES
('A-101', 'Mr. Sharma', 'sharma@gmail.com', '9876543210', '$2a$10$HASH_HERE'),
('A-102', 'Mrs. Patel', 'patel@gmail.com', '9876543211', '$2a$10$HASH_HERE'),
('A-103', 'Mr. Singh', 'singh@gmail.com', '9876543212', '$2a$10$HASH_HERE');
-- ... add all 97 members
```

To generate bcrypt hashes, use: https://bcrypt-generator.com/

---

## How It Works

### For Members:
- Go to www.ravirajspring.com
- Login with flat number + password
- See General Notices and AGM Notices tabs
- All notices appear newest first

### For Admin (Secretary/Chairman):
- Login with ADMIN credentials
- **Create Notice tab**: Write a notice, pick type (General/AGM), publish
- **Share to WhatsApp**: After writing, click the green WhatsApp button — it opens WhatsApp with the notice text ready to send to your group
- **Email**: General notices automatically send an email to all members who have an email address on file
- **All Notices tab**: View and delete old notices
- **Members tab**: Add/remove members, see the full list

---

## Costs

Everything is free:
- **Supabase free tier**: 500 MB database, 50,000 monthly active users
- **Vercel free tier**: unlimited deployments, custom domain, SSL
- **Resend free tier**: 100 emails per day (enough for 97 members)
- **Spaceship domain**: you already have this

---

## Troubleshooting

- **Can't login**: Check that the flat number matches exactly (uppercase). Check the password hash in Supabase.
- **Emails not sending**: Check RESEND_API_KEY in Vercel environment variables. Check Resend dashboard for errors.
- **Domain not working**: DNS can take up to 24 hours. Check Vercel > Settings > Domains for status.
- **WhatsApp button not working**: It opens wa.me in a new tab — make sure WhatsApp Web or the app is installed.

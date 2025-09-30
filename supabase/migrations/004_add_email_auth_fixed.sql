-- Migration: Add email authentication support (FIXED)
-- Date: 2025-09-30
-- Purpose: Replace phone SMS auth with email magic link auth

-- Add email column for authentication (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='email') THEN
    ALTER TABLE users ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add unique constraint on email (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email_unique') THEN
    CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;
  END IF;
END $$;

-- Make phone fields optional (skip if already nullable)
DO $$
BEGIN
  ALTER TABLE users ALTER COLUMN phone_number_encrypted DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE users ALTER COLUMN phone_hash DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Add auth method tracking (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='auth_method') THEN
    ALTER TABLE users ADD COLUMN auth_method TEXT DEFAULT 'email'
      CHECK (auth_method IN ('email', 'phone', 'google', 'apple'));
  END IF;
END $$;

-- Add constraint: must have either email or phone (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage
                 WHERE constraint_name='user_contact_required') THEN
    ALTER TABLE users ADD CONSTRAINT user_contact_required
      CHECK (email IS NOT NULL OR phone_hash IS NOT NULL);
  END IF;
END $$;

-- Add index for email lookups (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
    CREATE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- Update existing test users to have unique email (only if email is NULL)
UPDATE users
SET email = 'test' || id::text || '@albaniarides.test',
    auth_method = 'phone'
WHERE email IS NULL;

-- For new users, email is required by default (skip if already NOT NULL)
DO $$
BEGIN
  ALTER TABLE users ALTER COLUMN email SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add auth provider fields (skip if exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='auth_provider_id') THEN
    ALTER TABLE users ADD COLUMN auth_provider_id TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='auth_provider') THEN
    ALTER TABLE users ADD COLUMN auth_provider TEXT;
  END IF;
END $$;

-- Add index for auth provider (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_auth_provider') THEN
    CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
  END IF;
END $$;
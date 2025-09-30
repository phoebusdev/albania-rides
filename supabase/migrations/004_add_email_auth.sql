-- Migration: Add email authentication support
-- Date: 2025-09-30
-- Purpose: Replace phone SMS auth with email magic link auth

-- Add email column for authentication
ALTER TABLE users ADD COLUMN email TEXT;

-- Add unique constraint on email
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Make phone fields optional (keep for contact purposes)
ALTER TABLE users ALTER COLUMN phone_number_encrypted DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone_hash DROP NOT NULL;

-- Add auth method tracking
ALTER TABLE users ADD COLUMN auth_method TEXT DEFAULT 'email'
  CHECK (auth_method IN ('email', 'phone', 'google', 'apple'));

-- Add constraint: must have either email or phone
ALTER TABLE users ADD CONSTRAINT user_contact_required
  CHECK (email IS NOT NULL OR phone_hash IS NOT NULL);

-- Add index for email lookups (performance)
CREATE INDEX idx_users_email ON users(email);

-- Update existing test users to have email
UPDATE users
SET email = 'test' || substring(id::text, 1, 8) || '@albaniarides.test',
    auth_method = 'phone'
WHERE email IS NULL;

-- For new users, email is required by default
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add auth provider ID (for OAuth later)
ALTER TABLE users ADD COLUMN auth_provider_id TEXT;
ALTER TABLE users ADD COLUMN auth_provider TEXT;
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
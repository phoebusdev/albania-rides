-- Migration: Add email authentication support (v2 - Fixed order)
-- Date: 2025-09-30
-- Purpose: Replace phone SMS auth with email magic link auth
-- Note: Safe to run multiple times

-- Step 1: Add email column (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT;
    RAISE NOTICE 'Added email column';
  ELSE
    RAISE NOTICE 'Email column already exists';
  END IF;
END $$;

-- Step 2: Add auth_method column (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='auth_method'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_method TEXT DEFAULT 'email'
      CHECK (auth_method IN ('email', 'phone', 'google', 'apple'));
    RAISE NOTICE 'Added auth_method column';
  ELSE
    RAISE NOTICE 'auth_method column already exists';
  END IF;
END $$;

-- Step 3: Add auth provider columns (if don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='auth_provider_id'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_provider_id TEXT;
    RAISE NOTICE 'Added auth_provider_id column';
  ELSE
    RAISE NOTICE 'auth_provider_id column already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='auth_provider'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_provider TEXT;
    RAISE NOTICE 'Added auth_provider column';
  ELSE
    RAISE NOTICE 'auth_provider column already exists';
  END IF;
END $$;

-- Step 4: Update existing users with unique emails (only where email is NULL)
UPDATE users
SET
  email = 'test' || id::text || '@albaniarides.test',
  auth_method = 'phone'
WHERE email IS NULL;

-- Step 5: Add unique index on email (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_users_email_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;
    RAISE NOTICE 'Created unique index on email';
  ELSE
    RAISE NOTICE 'Unique index on email already exists';
  END IF;
END $$;

-- Step 6: Add regular index on email (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_users_email'
  ) THEN
    CREATE INDEX idx_users_email ON users(email);
    RAISE NOTICE 'Created index on email';
  ELSE
    RAISE NOTICE 'Index on email already exists';
  END IF;
END $$;

-- Step 7: Add index on auth provider (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_users_auth_provider'
  ) THEN
    CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
    RAISE NOTICE 'Created index on auth_provider';
  ELSE
    RAISE NOTICE 'Index on auth_provider already exists';
  END IF;
END $$;

-- Step 8: Make phone fields optional
DO $$
BEGIN
  -- Check if phone_number_encrypted is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users'
      AND column_name='phone_number_encrypted'
      AND is_nullable='NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN phone_number_encrypted DROP NOT NULL;
    RAISE NOTICE 'Made phone_number_encrypted nullable';
  ELSE
    RAISE NOTICE 'phone_number_encrypted already nullable';
  END IF;
END $$;

DO $$
BEGIN
  -- Check if phone_hash is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users'
      AND column_name='phone_hash'
      AND is_nullable='NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN phone_hash DROP NOT NULL;
    RAISE NOTICE 'Made phone_hash nullable';
  ELSE
    RAISE NOTICE 'phone_hash already nullable';
  END IF;
END $$;

-- Step 9: Add constraint for email or phone required (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='user_contact_required'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT user_contact_required
      CHECK (email IS NOT NULL OR phone_hash IS NOT NULL);
    RAISE NOTICE 'Added user_contact_required constraint';
  ELSE
    RAISE NOTICE 'user_contact_required constraint already exists';
  END IF;
END $$;

-- Step 10: Make email required for new users
DO $$
BEGIN
  -- Only set NOT NULL if all existing rows have email
  IF NOT EXISTS (SELECT 1 FROM users WHERE email IS NULL) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='users'
        AND column_name='email'
        AND is_nullable='YES'
    ) THEN
      ALTER TABLE users ALTER COLUMN email SET NOT NULL;
      RAISE NOTICE 'Made email NOT NULL';
    ELSE
      RAISE NOTICE 'email already NOT NULL';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping email NOT NULL - some rows still have NULL email';
  END IF;
END $$;
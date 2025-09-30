# Authentication Migration Plan

**Date**: September 30, 2025
**From**: Phone SMS verification (Twilio - paid)
**To**: Email magic link (Supabase - free) + Google OAuth (free)

---

## Part 1: Email Magic Link Authentication (Free)

### What is Magic Link Auth?

**User Experience**:
1. User enters email address
2. System sends email with unique link
3. User clicks link
4. Automatically logged in (no password needed)

**Why This Works**:
- ✅ Completely free (Supabase built-in)
- ✅ No password to remember
- ✅ No SMS costs
- ✅ More reliable than SMS
- ✅ Works in any country

---

## Current vs New Architecture

### Current (Phone SMS)
```
User → Enter Phone → SMS Code → Verify Code → JWT Token → Logged In
       (Twilio)      (Twilio)   (Twilio API)
       Cost: $0.05/verification
```

### New (Email Magic Link)
```
User → Enter Email → Magic Link → Click Link → Supabase Session → Logged In
       (Free)        (Free)       (Free)
       Cost: $0
```

---

## Database Schema Changes Required

### Current Schema (Phone-based)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone_number_encrypted TEXT NOT NULL,  -- Remove
  phone_hash TEXT UNIQUE NOT NULL,        -- Remove
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  ...
)
```

### New Schema (Email-based)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,             -- Add
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone_number_encrypted TEXT,            -- Optional (for contact)
  phone_hash TEXT,                        -- Optional
  ...
)
```

### Migration Strategy

**Option 1: Keep Phone as Optional Contact Info** (Recommended)
- Users authenticate with email
- Phone number becomes optional profile field
- Still useful for SMS notifications (if Twilio added later)
- No data loss

**Option 2: Full Replacement**
- Remove all phone fields
- Only use email
- Simpler schema
- Lose phone contact ability

---

## Implementation Steps for Email Auth

### Step 1: Enable Supabase Auth (5 minutes)

Supabase has built-in authentication. You've been building a custom auth system, but we can use Supabase's instead.

**In Supabase Dashboard**:
1. Go to Authentication → Providers
2. Enable **Email** provider
3. Disable email confirmation (for faster testing) OR configure SMTP
4. Copy the magic link template

**No code changes needed** - Supabase handles:
- Email sending
- Link generation
- Session management
- Token refresh

---

### Step 2: Update Database Migration (10 minutes)

Create new migration: `004_add_email_auth.sql`

```sql
-- Add email column
ALTER TABLE users ADD COLUMN email TEXT UNIQUE;

-- Make phone optional (for existing data)
ALTER TABLE users ALTER COLUMN phone_number_encrypted DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone_hash DROP NOT NULL;

-- Update constraint to require either email or phone
ALTER TABLE users ADD CONSTRAINT user_contact_required
  CHECK (email IS NOT NULL OR phone_hash IS NOT NULL);

-- Add index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- For new users, email is required
ALTER TABLE users ADD COLUMN auth_method TEXT DEFAULT 'email'
  CHECK (auth_method IN ('email', 'phone', 'google', 'apple'));
```

---

### Step 3: Replace Custom Auth with Supabase Auth (30 minutes)

**Current Flow** (Custom):
```
app/api/auth/register → Insert users table → Send SMS → Return
app/api/auth/verify   → Check code → Create JWT → Return token
app/api/auth/login    → Check phone → Send SMS → Return
```

**New Flow** (Supabase):
```
Frontend → supabase.auth.signInWithOtp({ email }) → Done
           ↓
        Email sent automatically
           ↓
        User clicks link
           ↓
        Supabase session created
           ↓
        Redirect to app
```

**Code Changes**:

**Delete** (no longer needed):
- `app/api/auth/register/route.ts`
- `app/api/auth/verify/route.ts`
- `app/api/auth/login/route.ts`
- `lib/twilio/client.ts`
- `lib/utils/crypto.ts` (phone encryption)

**Update**:
- `app/(auth)/register/page.tsx` - Change to email input
- `app/(auth)/login/page.tsx` - Change to email input
- `app/(auth)/verify/page.tsx` - Remove (auto-handled by magic link)

**New Register Flow**:
```typescript
// app/(auth)/register/page.tsx
const handleRegister = async (email: string, name: string, city: string) => {
  // 1. Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      data: { name, city } // Metadata
    }
  })

  if (error) throw error

  // 2. Create user profile (after email confirmed)
  // This happens automatically via Supabase trigger or webhook

  return { message: 'Check your email for magic link' }
}
```

---

### Step 4: Update Middleware (5 minutes)

**Current** (Custom JWT):
```typescript
const authHeader = request.headers.get('authorization')
const userId = await getUserIdFromRequest(authHeader)
```

**New** (Supabase Session):
```typescript
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

### Step 5: Remove Phone Validation (2 minutes)

**Delete**:
- `lib/utils/validation.ts` → `validateAlbanianPhone()`
- `lib/utils/validation.ts` → `formatPhoneNumber()`

**Keep**:
- All other validation functions (seats, price, etc.)

---

### Benefits of Email Auth

| Feature | Phone SMS | Email Magic Link |
|---------|-----------|------------------|
| **Cost** | $0.05/verification | $0 (free forever) |
| **Reliability** | 95-98% delivery | 99.9% delivery |
| **Speed** | 5-30 seconds | 1-5 seconds |
| **Country Support** | Limited by Twilio | Universal |
| **User Experience** | Need phone, wait for SMS | Click link, done |
| **Security** | Same | Same (better - email harder to intercept) |
| **Maintenance** | Twilio account, API keys | None (built-in) |

---

## Part 2: Google OAuth ("Login with Google")

### What is OAuth?

**User Experience**:
1. User clicks "Login with Google"
2. Redirected to Google login page
3. User logs in with Google account
4. Redirected back to your app
5. Automatically logged in

**Why Users Love It**:
- ✅ One-click login (no form to fill)
- ✅ No password to remember
- ✅ Trusted (everyone has Google account)
- ✅ Profile info pre-filled (name, email, photo)

---

## Google OAuth Requirements

### 1. Google Cloud Project (Free)

**Time**: 10 minutes

**Steps**:
1. Go to https://console.cloud.google.com
2. Create new project: "AlbaniaRides"
3. Enable Google+ API
4. Create OAuth consent screen
5. Create OAuth credentials

**Cost**: $0 (free forever)

---

### 2. OAuth Consent Screen Setup

**Required Information**:
- **App name**: AlbaniaRides
- **User support email**: your@email.com
- **App logo**: (optional)
- **Authorized domains**: vercel.app
- **Developer contact**: your@email.com

**Scopes Needed**:
- `email` - Get user email
- `profile` - Get user name and photo

**User Type**:
- External (for public app)
- Testing mode (100 users max until verified)
- Production mode (unlimited - requires Google review)

---

### 3. OAuth Credentials

**After consent screen**:
1. Go to Credentials → Create Credentials → OAuth Client ID
2. Application type: **Web application**
3. Name: "AlbaniaRides Web"
4. Authorized JavaScript origins:
   ```
   https://albania-rides.vercel.app
   https://localhost:3000  (for development)
   ```
5. Authorized redirect URIs:
   ```
   https://albania-rides.vercel.app/auth/callback
   https://localhost:3000/auth/callback
   ```

**Result**: You get:
- **Client ID**: `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123xyz`

---

### 4. Enable in Supabase (2 minutes)

**In Supabase Dashboard**:
1. Go to Authentication → Providers
2. Find "Google" provider
3. Toggle **Enable**
4. Paste:
   - Google Client ID
   - Google Client Secret
5. Copy the Callback URL: `https://your-project.supabase.co/auth/v1/callback`
6. Add this URL to Google Console redirect URIs

**Done!** Supabase now handles all OAuth flow.

---

### 5. Add Environment Variables

**In Vercel**:
```bash
# Supabase already has these
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# No additional variables needed!
# Google credentials are in Supabase dashboard
```

---

### 6. Frontend Code (5 minutes)

**Add Google button to login page**:

```tsx
// app/(auth)/login/page.tsx
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) console.error('Error:', error.message)
  }

  return (
    <div>
      <h1>Login</h1>

      {/* Google OAuth Button */}
      <button onClick={handleGoogleLogin} className="btn-primary">
        <img src="/google-logo.svg" alt="" width={20} height={20} />
        Login with Google
      </button>

      {/* OR separator */}
      <div className="divider">OR</div>

      {/* Email magic link form */}
      <form>
        <input type="email" placeholder="Enter your email" />
        <button type="submit">Send Magic Link</button>
      </form>
    </div>
  )
}
```

---

### 7. Callback Handler (5 minutes)

**Create callback page**: `app/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home or dashboard
  return NextResponse.redirect(new URL('/trips', request.url))
}
```

---

### 8. Handle User Profile (10 minutes)

**After OAuth login**, create user profile in your database:

**Option A: Use Supabase Trigger** (Recommended)
```sql
-- Create function to handle new auth users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, photo_url, city, auth_method)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    'TIA', -- Default city
    'google'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Option B: Manual in Code**
```typescript
// After successful OAuth
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  // Check if profile exists
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Create profile
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: user.user_metadata.name,
      photo_url: user.user_metadata.avatar_url,
      city: 'TIA', // Ask user to select later
      auth_method: 'google'
    })
  }
}
```

---

## Google OAuth Flow Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Clicks "Login with Google"
     ▼
┌─────────────────┐
│  Your App       │
│  supabase.auth  │
│  .signInWithOAuth│
└────┬────────────┘
     │ Redirects to Google
     ▼
┌─────────────────┐
│  Google Login   │
│  accounts.google│
└────┬────────────┘
     │ User logs in
     │ Approves permissions
     ▼
┌─────────────────┐
│  Google Returns │
│  with code      │
└────┬────────────┘
     │ Redirect to: yourapp.com/auth/callback?code=xxx
     ▼
┌─────────────────┐
│  Callback Route │
│  exchanges code │
│  for session    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Create/Update  │
│  User Profile   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Redirect to    │
│  /trips         │
└─────────────────┘
```

---

## Comparison Table

| Feature | Phone SMS | Email Magic Link | Google OAuth |
|---------|-----------|------------------|--------------|
| **Setup Time** | 30 min | 15 min | 20 min |
| **Cost** | $0.05/user | Free | Free |
| **User Steps** | Enter phone, wait, enter code | Enter email, click link | Click button |
| **Trust Factor** | Medium | High | Highest |
| **Profile Data** | Manual | Manual | Auto-filled |
| **Maintenance** | Medium | None | None |
| **International** | Limited | Universal | Universal |

---

## Complete Implementation Checklist

### Phase 1: Email Magic Link (2 hours)
- [ ] Create migration 004 to add email column
- [ ] Run migration in Supabase
- [ ] Enable Email provider in Supabase Auth settings
- [ ] Update register page to use email instead of phone
- [ ] Update login page to use email
- [ ] Remove verify page (not needed)
- [ ] Update middleware to use Supabase sessions
- [ ] Remove custom JWT code
- [ ] Remove Twilio code
- [ ] Test registration flow
- [ ] Test login flow

### Phase 2: Google OAuth (1 hour)
- [ ] Create Google Cloud project
- [ ] Setup OAuth consent screen
- [ ] Create OAuth credentials
- [ ] Add credentials to Supabase dashboard
- [ ] Add callback URL to Google Console
- [ ] Create auth/callback route
- [ ] Add "Login with Google" button to login page
- [ ] Add "Sign up with Google" button to register page
- [ ] Create database trigger for auto-profile creation
- [ ] Test Google login flow

### Phase 3: Cleanup (30 minutes)
- [ ] Remove phone validation from forms
- [ ] Update user profile to make phone optional
- [ ] Remove Twilio environment variables
- [ ] Update documentation
- [ ] Deploy to Vercel
- [ ] Test both flows in production

**Total Time**: ~3.5 hours
**Total Cost**: $0

---

## Migration Path for Existing Users

If you have existing users with phone numbers:

**Option 1: Dual Auth** (Recommended for transition)
- Keep phone auth working
- Add email auth
- Let users choose
- Gradually deprecate phone

**Option 2: Force Email Collection**
- On first login with phone
- Prompt: "Add email for easier login"
- Store both phone + email
- Next time, they can use email

**Option 3: Fresh Start**
- This is a new deployment
- No existing users yet
- Just switch to email/Google

---

## Security Considerations

### Email Magic Link
- ✅ Links expire (default: 1 hour)
- ✅ One-time use only
- ✅ Tied to specific browser session
- ✅ Can't be forwarded/reused

### Google OAuth
- ✅ Google handles security
- ✅ 2FA if user has it enabled
- ✅ Tokens expire and refresh
- ✅ Can revoke access anytime

### What You Lose from Phone
- ❌ Albanian phone number requirement (becomes optional)
- ❌ SMS notifications (need Twilio for this)
- ❌ Phone verification (trust email instead)

### What You Gain
- ✅ Email notifications (free via Supabase)
- ✅ Password reset flows (if you add passwords later)
- ✅ Better user experience
- ✅ Zero ongoing costs

---

## Next Steps

**Immediate**:
1. Decide: Email only, or Email + Google?
2. Create migration 004
3. Enable Supabase Auth providers
4. Update frontend forms

**This Week**:
1. Test flows thoroughly
2. Deploy to production
3. Monitor for issues

**Future Enhancements**:
- Add Apple Sign In (similar to Google)
- Add Facebook Login (if needed)
- Add email/password option (traditional)
- Re-add SMS for booking notifications only

---

**Status**: Ready to implement. All free. Takes ~3.5 hours.
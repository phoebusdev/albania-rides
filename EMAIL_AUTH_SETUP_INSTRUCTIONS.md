# Email Authentication Setup Instructions

**Date**: September 30, 2025
**Status**: Code changes complete - Manual Supabase configuration required

---

## What Was Done Automatically

✅ **Database Migration Created**
- File: `supabase/migrations/004_add_email_auth.sql`
- Adds `email` column to users table
- Makes phone fields optional
- Adds auth_method tracking
- Ready to run

✅ **Auth API Routes Created**
- File: `app/api/auth/email-login/route.ts`
- Handles both registration and login
- Sends magic links via Supabase
- Creates user profiles automatically

✅ **Callback Handler Created**
- File: `app/auth/callback/route.ts`
- Processes magic link clicks
- Exchanges code for session
- Creates user profile if needed

✅ **Frontend Updated**
- Register page now uses email input
- Login page now uses email input
- Verify page removed (not needed with magic links)
- Success messages show instructions

✅ **Middleware Updated**
- Now uses Supabase session auth
- Removed custom JWT checks
- Protects pages with Supabase user check

✅ **Old Phone Auth Removed**
- Deleted: `/app/(auth)/verify/page.tsx`
- Deleted: `/app/api/auth/register/route.ts`
- Deleted: `/app/api/auth/login/route.ts`
- Deleted: `/app/api/auth/verify/route.ts`

---

## What You Need To Do Manually

### Step 1: Run Database Migration (2 minutes)

**In Supabase Dashboard**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/004_add_email_auth.sql`
6. Paste into the editor
7. Click **Run**

**Expected Result**: "Success. No rows returned"

**What This Does**:
- Adds `email` column to users table
- Makes `phone_number_encrypted` and `phone_hash` optional
- Adds indexes for performance
- Updates existing test users with placeholder emails

---

### Step 2: Enable Email Authentication (5 minutes)

**In Supabase Dashboard**:

1. Go to **Authentication** → **Providers**

2. Find **Email** provider in the list

3. Toggle it **ON** (enable it)

4. Configure settings:
   ```
   ✓ Enable Email provider
   ✓ Confirm email: DISABLED (for faster testing)
   ✓ Secure email change: ENABLED
   ```

5. **Important**: Set up email sending

   **Option A: Use Supabase's SMTP (Free, Limited)**
   - Default is enabled
   - Limited to 3 emails per hour in free tier
   - Fine for testing
   - **No configuration needed**

   **Option B: Use Your Own SMTP (Recommended for Production)**
   - Scroll down to "SMTP Settings"
   - Toggle "Enable Custom SMTP"
   - Enter details:
     ```
     Host: smtp.gmail.com (or your provider)
     Port: 587
     Username: your@email.com
     Password: your-app-specific-password
     Sender email: noreply@albaniarides.com
     Sender name: AlbaniaRides
     ```

   **For Gmail**:
   - Use App Password (not regular password)
   - Generate at: https://myaccount.google.com/apppasswords
   - Need to enable 2FA first

   **For SendGrid** (Free tier: 100 emails/day):
   - Sign up at sendgrid.com
   - Create API key
   - Use SMTP: smtp.sendgrid.net
   - Username: apikey
   - Password: [your API key]

6. Click **Save**

---

### Step 3: Configure Email Templates (Optional, 5 minutes)

**In Supabase Dashboard**:
1. Go to **Authentication** → **Email Templates**

2. Find **Magic Link** template

3. Customize the email (optional):
   ```html
   <h2>Welcome to AlbaniaRides!</h2>
   <p>Click the link below to login:</p>
   <p><a href="{{ .ConfirmationURL }}">Login to AlbaniaRides</a></p>
   <p>This link expires in 1 hour.</p>
   ```

4. Click **Save**

---

### Step 4: Update Environment Variables (2 minutes)

**What You Already Have** (no changes needed):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**What To Add** (optional):
```bash
NEXT_PUBLIC_APP_URL=https://albania-rides.vercel.app
```

This is used for the magic link callback URL.

**Where to Add**:
- Locally: `.env.local` file
- Vercel: Project Settings → Environment Variables

---

### Step 5: Deploy to Vercel (2 minutes)

**Commit and push the changes**:
```bash
git add -A
git commit -m "Implement email magic link authentication"
git push
```

**Vercel will automatically**:
- Rebuild the app
- Deploy the changes
- New auth system goes live

---

### Step 6: Test the Flow (5 minutes)

1. **Go to your deployed app**:
   ```
   https://albania-rides.vercel.app/register
   ```

2. **Register a new account**:
   - Enter your real email address
   - Enter your name
   - Select your city
   - Click "Continue"

3. **Check your email**:
   - Should arrive within 30 seconds
   - Subject: "Confirm your signup"
   - Click the magic link

4. **You should be**:
   - Redirected back to the app
   - Automatically logged in
   - Taken to `/trips` page

5. **Test login**:
   - Logout (clear cookies)
   - Go to `/login`
   - Enter same email
   - Get new magic link
   - Click it, logged in again

---

## Troubleshooting

### Problem: "Email not sent"

**Check**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Verify Email provider is enabled
3. Check SMTP configuration if using custom SMTP

**For Gmail Users**:
- Make sure you're using an App Password, not your regular password
- Enable "Less secure app access" if using old Gmail
- Or better: Use SendGrid (free tier)

### Problem: "Magic link doesn't work"

**Check**:
1. Link expires after 1 hour - request a new one
2. Links can only be used once
3. Check URL in email matches your app URL
4. Look at browser console for errors

**Fix**:
- In Supabase: Authentication → URL Configuration
- Set "Site URL" to your production URL: `https://albania-rides.vercel.app`
- Set "Redirect URLs" to include: `https://albania-rides.vercel.app/auth/callback`

### Problem: "User profile not created"

**Check**: Supabase logs:
1. Go to Supabase Dashboard → Logs
2. Look for errors in auth.users insert

**Fix**: The callback handler should auto-create profiles. If it doesn't:
- Check `app/auth/callback/route.ts` logs
- Verify the users table allows the insert

### Problem: "Email goes to spam"

**Solutions**:
1. Use custom domain email (noreply@yourdomain.com)
2. Set up SPF/DKIM records for your domain
3. Use a dedicated email service (SendGrid, AWS SES)
4. For testing, just check spam folder

---

## Testing Checklist

After setup, verify:

- [ ] Migration 004 ran successfully
- [ ] Email provider enabled in Supabase
- [ ] SMTP configured (default or custom)
- [ ] Can register with email
- [ ] Receive magic link email
- [ ] Magic link works (logs you in)
- [ ] User profile created in database
- [ ] Can login again with same email
- [ ] Protected pages redirect to login if not authenticated
- [ ] Can access /trips after login

---

## What Changed from Phone Auth

### Before (Phone SMS):
1. User enters phone number
2. Twilio sends SMS with 6-digit code
3. User enters code
4. Custom JWT token created
5. Token stored in localStorage

**Costs**: $0.05 per verification

### After (Email Magic Link):
1. User enters email
2. Supabase sends email with link
3. User clicks link
4. Supabase session created
5. Session stored in secure cookies

**Costs**: $0 (completely free)

---

## Security Notes

### Magic Links Are Secure:
- ✅ Links expire after 1 hour
- ✅ One-time use only
- ✅ Tied to IP address (optional)
- ✅ Secure token in URL (not guessable)
- ✅ HTTPS only

### Session Management:
- ✅ HttpOnly cookies (can't be stolen by JS)
- ✅ Automatic refresh (no manual token handling)
- ✅ Server-side validation
- ✅ Logout clears all sessions

### Email Security:
- ⚠️ Email can be intercepted (use HTTPS always)
- ⚠️ User must secure their email account
- ✅ Better than SMS (harder to intercept)
- ✅ User controls who has access

---

## Migration Strategy for Existing Users

**If you have existing users with phone numbers**:

1. **Current test users**:
   - Migration 004 adds placeholder emails
   - Format: `test<uuid>@albaniarides.test`
   - These won't receive real emails

2. **For real existing users** (when you have them):
   - Keep phone auth working temporarily
   - Add email field to profile page
   - Prompt: "Add email for easier login"
   - Next time, offer both options
   - Eventually deprecate phone auth

3. **Fresh start** (recommended for now):
   - You don't have real users yet
   - Just switch to email
   - Test users are dummy data anyway

---

## Cost Comparison

| Item | Phone SMS | Email Magic Link |
|------|-----------|------------------|
| Setup Time | 30 min | 15 min |
| Monthly Cost | $50-100 | $0 |
| Per User Cost | $0.05 | $0 |
| Maintenance | Medium | None |
| Reliability | 95-98% | 99.9% |
| International | Limited | Universal |

**Savings**: ~$600/year for 1,000 users

---

## Next Steps After Email Auth Works

1. **Add Google OAuth** (optional, 1 hour)
   - See `AUTH_MIGRATION_PLAN.md` for instructions
   - Gives users "Login with Google" option
   - Also free

2. **Add profile completion**
   - Prompt for phone number (optional contact info)
   - Let users add profile photo
   - Collect driver details if they want to drive

3. **Email notifications** (free via Supabase)
   - Booking confirmations
   - Ride reminders
   - Cancellation notices
   - Better than SMS and free!

---

## Support

**If you get stuck**:

1. Check Supabase logs:
   - Dashboard → Logs → Filter by "auth"

2. Check browser console:
   - F12 → Console tab
   - Look for errors

3. Check network tab:
   - F12 → Network tab
   - See if API calls succeed

4. Verify environment variables:
   - Vercel: Project → Settings → Environment Variables
   - All variables set?
   - Did you redeploy after adding them?

---

## Summary

**What works now**: Code is ready for email auth
**What you need**: 15 minutes to configure Supabase
**Total cost**: $0
**User experience**: Better than SMS

**After setup, users can**:
- Register with email (no phone)
- Get magic link in email
- Click to login (no password)
- Profile auto-created
- Session managed automatically

---

**Ready to go!** Just follow steps 1-6 above.
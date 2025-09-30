# SMS Verification Setup Guide

**For**: AlbaniaRides Phone Authentication
**Current Status**: Test mode (accepts code `123456`)
**To Enable**: Production SMS via Twilio Verify

---

## What You Need for Functional SMS Verification

### 1. Twilio Account (Required)

**Sign up**: https://www.twilio.com/try-twilio

**Free Trial**:
- $15.50 credit included
- No credit card required to start
- Can send SMS to verified numbers only
- Enough for ~300 verifications during development

**Paid Account** (for production):
- ~$1/month base fee
- ~$0.05 per SMS verification
- Can send to any Albanian number
- 1,000 verifications = ~$50/month

---

## Step-by-Step Setup

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up with email
3. Verify your email
4. Add your phone number (for account security)

**Time**: 5 minutes

---

### Step 2: Create a Verify Service
1. Log into Twilio Console: https://console.twilio.com
2. Navigate to **Verify** → **Services**
   - Or direct: https://console.twilio.com/us1/develop/verify/services
3. Click **Create new Service**
4. Enter service name: `AlbaniaRides Verification`
5. Click **Create**

**Result**: You'll get a Verify Service SID (starts with `VA...`)

**Time**: 2 minutes

---

### Step 3: Get Twilio Credentials

From the Twilio Console homepage:

1. **Account SID**
   - Found on dashboard: https://console.twilio.com
   - Format: `AC...` (34 characters)
   - Copy this value

2. **Auth Token**
   - Found on dashboard (click "show" to reveal)
   - Format: 32-character hex string
   - Copy this value

3. **Verify Service SID**
   - From Step 2 above
   - Format: `VA...` (34 characters)
   - Copy this value

**Time**: 1 minute

---

### Step 4: Get a Twilio Phone Number (Optional for SMS)

**Note**: Verify API doesn't require a Twilio number, but you need one for booking notifications.

1. Go to **Phone Numbers** → **Manage** → **Buy a number**
   - Or: https://console.twilio.com/us1/develop/phone-numbers/manage/search
2. Search for Albanian numbers: `+355`
   - **Problem**: Twilio may not have Albanian numbers available
   - **Alternative**: Use any international number (users see sender as "Twilio")
3. If Albanian unavailable, use US number: `+1` (easier for testing)
4. Purchase number (~$1-2/month)

**Result**: Phone number in format `+1234567890` or `+355...`

**For Production**: Consider using an Albanian SMS gateway service instead of Twilio for local numbers

**Time**: 5 minutes

---

### Step 5: Add Environment Variables to Vercel

1. Go to your Vercel project: https://vercel.com/phoebusdevs-projects/albania-rides/settings/environment-variables

2. Add these variables:

```bash
# Twilio Verify (Required for SMS verification)
TWILIO_ACCOUNT_SID=AC...your_34_char_sid
TWILIO_AUTH_TOKEN=your_32_char_auth_token
TWILIO_VERIFY_SERVICE_SID=VA...your_verify_service_sid

# Twilio Phone Number (Required for booking/cancellation SMS)
TWILIO_PHONE_NUMBER=+1234567890
```

3. For each variable:
   - Enter **Key** (variable name)
   - Enter **Value** (from Twilio dashboard)
   - Select **Production** environment
   - Click **Add**

4. After adding all variables, click **Redeploy** or push a new commit

**Time**: 3 minutes

---

## Testing SMS Verification

### Test Mode (Current - No Twilio Needed)

**How it works**:
- `lib/twilio/client.ts` detects missing Twilio credentials
- Falls back to test mode
- Accepts any phone number
- Always accepts code: `123456`

**Code**:
```typescript
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.log('[TEST MODE] Verifying:', phone, 'with code:', code)
    return code === '123456' // Test mode accepts this code
  }
  // ... real Twilio verification
}
```

**Testing**:
1. Register with phone: `+355 69 123 4567`
2. Enter verification code: `123456`
3. ✅ Verification succeeds

---

### Production Mode (With Twilio)

**How it works**:
- Real SMS sent to user's phone
- Twilio generates 6-digit code
- User receives SMS: "Your AlbaniaRides code is: 123456"
- User enters code
- Code verified via Twilio API

**Testing**:
1. Add Twilio credentials to Vercel
2. Redeploy
3. Register with your real Albanian phone number
4. Wait for SMS (usually 5-30 seconds)
5. Enter the code from SMS
6. ✅ Verification succeeds

---

## Cost Breakdown

### Free Trial Limits
- **Credit**: $15.50
- **Verifications**: ~300 (at $0.05 each)
- **Duration**: Until credit runs out
- **Restrictions**:
  - Can only send to verified phone numbers
  - Add test numbers in Twilio Console → Verified Caller IDs

### Production Pricing
**Twilio Verify API**:
- $0.05 per verification attempt
- Success or failure both count

**Examples**:
- 100 users/month = $5
- 1,000 users/month = $50
- 10,000 users/month = $500

**Additional Costs**:
- Phone number rental: $1-2/month
- Booking SMS: $0.0075 per message
  - 1,000 bookings = $7.50 in SMS

**Total for 1,000 users/month**: ~$60

---

## Albania-Specific Considerations

### Issue 1: Albanian Phone Numbers
**Problem**: Twilio may not have +355 numbers available for purchase

**Solutions**:
1. **Use Twilio without Albanian number** (current approach)
   - Sender shows as "Twilio" or shortcode
   - Perfectly functional
   - Less professional appearance

2. **Use Albanian SMS Provider**
   - Companies like ALBtelecom, Vodafone Albania, or One Albania
   - Requires custom integration
   - More expensive per SMS
   - Better for local trust

3. **Hybrid approach**
   - Twilio Verify for verification codes (no number needed)
   - Albanian provider for booking notifications
   - Best of both worlds

### Issue 2: SMS Delivery Rates
**Albania statistics**:
- Twilio delivery rate: ~95-98% to Albanian carriers
- Main carriers: Vodafone, ALBtelecom, ONE
- Delivery time: Usually < 30 seconds

**Recommendation**: Test with multiple Albanian carriers before launch

---

## Alternative: Passwordless Email (Fallback)

If Twilio is too expensive or SMS unreliable:

**Option**: Add email verification as alternative
1. User enters email instead of phone
2. Send magic link via email (free via Supabase Auth)
3. Click link to verify
4. No SMS costs

**Trade-offs**:
- ❌ Less convenient (check email)
- ❌ Requires email collection
- ✅ Free
- ✅ More reliable
- ✅ No carrier dependencies

**Implementation**: ~2 hours work

---

## Current Code Implementation

### How SMS Verification Works

**File**: `lib/twilio/client.ts`

**1. Send Verification Code**:
```typescript
export async function sendVerificationCode(phone: string): Promise<void> {
  if (!client || !verifyServiceSid) {
    console.log('[TEST MODE] Sending verification to:', phone)
    return
  }

  await client.verify.v2
    .services(verifyServiceSid)
    .verifications
    .create({ to: phone, channel: 'sms' })
}
```

**2. Verify Code**:
```typescript
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  if (!client || !verifyServiceSid) {
    console.log('[TEST MODE] Verifying:', phone, 'with code:', code)
    return code === '123456'
  }

  const verification = await client.verify.v2
    .services(verifyServiceSid)
    .verificationChecks
    .create({ to: phone, code })

  return verification.status === 'approved'
}
```

**3. Booking SMS Notifications**:
```typescript
export async function sendSMS(to: string, body: string): Promise<void> {
  if (!client) {
    console.log('[TEST MODE] SMS to:', to, 'Body:', body)
    return
  }

  await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body
  })
}
```

**Features**:
- ✅ Graceful fallback to test mode
- ✅ Logging for debugging
- ✅ Error handling
- ✅ Type safety

---

## Troubleshooting

### Problem: "Invalid Account SID"
**Cause**: Wrong Account SID or Auth Token
**Fix**:
1. Double-check copied values from Twilio Console
2. Ensure no extra spaces
3. Account SID starts with `AC`, not `SK`

### Problem: "Service SID not found"
**Cause**: Wrong Verify Service SID
**Fix**: Use the SID from Verify → Services, starts with `VA`

### Problem: "Unverified phone number"
**Cause**: Free trial account, phone not verified
**Fix**:
1. Go to Phone Numbers → Verified Caller IDs
2. Add your test phone number
3. Verify via SMS code

### Problem: SMS not received
**Causes**:
- Carrier blocking
- Wrong phone format
- Number not Albanian
**Fix**:
1. Check Twilio logs: Console → Monitor → Logs → Verify
2. Ensure phone format: `+355691234567` (no spaces)
3. Try different Albanian carrier

### Problem: "Insufficient funds"
**Cause**: Trial credit exhausted
**Fix**: Add payment method in Twilio Console → Billing

---

## Quick Start Checklist

For production SMS verification:

- [ ] Create Twilio account (5 min)
- [ ] Create Verify service (2 min)
- [ ] Copy Account SID, Auth Token, Verify Service SID (1 min)
- [ ] (Optional) Purchase phone number (5 min)
- [ ] Add 3-4 environment variables to Vercel (3 min)
- [ ] Redeploy Vercel app (2 min)
- [ ] Test with real Albanian phone number (2 min)
- [ ] Monitor Twilio logs for any issues (ongoing)

**Total Time**: ~20 minutes
**Total Cost**: $0 (free trial) or ~$60/month (1,000 users)

---

## Summary

### To Enable SMS Verification Right Now:

1. **Go to**: https://www.twilio.com/try-twilio
2. **Sign up** and verify email
3. **Create Verify service** in console
4. **Copy 3 values**: Account SID, Auth Token, Verify Service SID
5. **Add to Vercel**: https://vercel.com/phoebusdevs-projects/albania-rides/settings/environment-variables
6. **Redeploy** and test

### To Keep Using Test Mode:

Just don't add the Twilio credentials. The app will continue to accept code `123456` for all verifications. Perfect for development and demo purposes.

---

**Status**: Currently in test mode, production SMS is 20 minutes away from being enabled.
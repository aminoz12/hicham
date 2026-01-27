# Quick Start: SumUp Integration Fix

## Problem
CORS error when calling SumUp API directly from the browser.

## Solution
Use Supabase Edge Functions as a proxy (already created in `supabase/functions/`).

## Quick Setup (5 minutes)

### Option 1: Deploy Supabase Edge Functions (Recommended)

1. **Install Supabase CLI** (if not installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in Supabase Dashboard → Settings → General)

4. **Set secrets**:
   ```bash
   supabase secrets set SUMUP_MERCHANT_ID=MXQYJZNR
   supabase secrets set SUMUP_SECRET_KEY=sup_sk_yB2V2HDFNcLvh4tkOaalv8bN8Sk5EtYls
   ```

5. **Deploy functions**:
   ```bash
   supabase functions deploy create-sumup-checkout
   supabase functions deploy get-sumup-checkout-status
   ```

6. **Verify in Supabase Dashboard**:
   - Go to Edge Functions
   - You should see both functions deployed

### Option 2: Use Netlify/Vercel Functions (Alternative)

If you're deploying to Netlify or Vercel, you can create serverless functions there instead.

### Option 3: Local Development Proxy (Temporary)

For local development only, you can run a simple Node.js proxy server:

```bash
# Install dependencies
npm install express cors

# Run proxy server (create a simple server.js)
node server.js
```

## Verify Setup

1. Make sure your `.env.local` has:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Test the checkout flow:
   - Add items to cart
   - Click "Proceed to Checkout"
   - Should redirect to SumUp payment page

## Troubleshooting

- **Error: "Supabase URL and Anon Key are required"**
  - Make sure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

- **Error: "Function not found"**
  - Make sure Edge Functions are deployed
  - Check function names match exactly

- **CORS errors persist**
  - Make sure you're using the Edge Functions (not direct API calls)
  - Check that `USE_PROXY = true` in `sumupService.ts`

## Files Created

- `supabase/functions/create-sumup-checkout/index.ts` - Creates checkout
- `supabase/functions/get-sumup-checkout-status/index.ts` - Gets status
- `SUPABASE_EDGE_FUNCTIONS_SETUP.md` - Detailed setup guide











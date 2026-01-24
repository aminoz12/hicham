# Supabase Edge Functions Setup for SumUp Integration

## Problem
SumUp API doesn't allow direct calls from the browser due to CORS restrictions. We need to use Supabase Edge Functions as a proxy.

## Setup Instructions

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables

Set the SumUp credentials as secrets in Supabase:

```bash
supabase secrets set SUMUP_MERCHANT_ID=MXQYJZNR
supabase secrets set SUMUP_SECRET_KEY=sup_sk_yB2V2HDFNcLvh4tkOaalv8bN8Sk5EtYls
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy create-sumup-checkout
supabase functions deploy get-sumup-checkout-status
```

### 6. Test Locally (Optional)

```bash
supabase functions serve create-sumup-checkout
supabase functions serve get-sumup-checkout-status
```

## Alternative: Use Netlify/Vercel Functions

If you prefer not to use Supabase Edge Functions, you can create similar proxy functions on:
- Netlify Functions
- Vercel Serverless Functions
- AWS Lambda
- Any other serverless platform

## Files Created

- `supabase/functions/create-sumup-checkout/index.ts` - Creates SumUp checkout sessions
- `supabase/functions/get-sumup-checkout-status/index.ts` - Gets checkout status

## Environment Variables Required

In Supabase Dashboard → Edge Functions → Secrets:
- `SUMUP_MERCHANT_ID`
- `SUMUP_SECRET_KEY`

## Testing

After deployment, the frontend will automatically use the Edge Functions as proxy. Make sure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env.local` file.







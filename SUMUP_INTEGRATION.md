# SumUp Payment Integration

This project uses SumUp Checkout to process payments securely. SumUp supports credit cards, Apple Pay, and Google Pay.

## Configuration

### Environment Variables

Add the following variables to your `.env.local` file:

```env
VITE_SUMUP_MERCHANT_ID=MXQYJZNR
VITE_SUMUP_SECRET_KEY=sup_sk_yB2V2HDFNcLvh4tkOaalv8bN8Sk5EtYls
VITE_SUMUP_PUBLIC_KEY=sup_pk_pduzGQ34gpck2xZeJT6ySGeqiigjUDgBg
```

### Default Credentials

If environment variables are not set, the service will use these default credentials:
- Merchant ID: `MXQYJZNR`
- Secret Key: `sup_sk_yB2V2HDFNcLvh4tkOaalv8bN8Sk5EtYls`
- Public Key: `sup_pk_pduzGQ34gpck2xZeJT6ySGeqiigjUDgBg`

## How It Works

1. **User clicks "Proceed to Checkout"** in the cart
2. **Checkout page** creates a SumUp checkout session via API
3. **User is redirected** to SumUp's secure payment page
4. **User completes payment** using credit card, Apple Pay, or Google Pay
5. **SumUp redirects back** to your site with payment status
6. **Order is confirmed** and cart is cleared

## Supported Payment Methods

- 💳 Credit Cards (Visa, Mastercard, etc.)
- 🍎 Apple Pay
- 📱 Google Pay

## API Endpoints Used

- `POST /v0.1/checkouts` - Create a new checkout session
- `GET /v0.1/checkouts/{checkout_id}` - Get checkout status

## Files

- `src/services/sumupService.ts` - SumUp API service
- `src/pages/Checkout.tsx` - Checkout page component
- `src/pages/CheckoutSuccess.tsx` - Success page after payment
- `src/components/Cart.tsx` - Updated cart with checkout button

## Testing

For testing, you can use SumUp's test mode. Make sure your SumUp account is set up for testing.

## Security Notes

- Secret keys should NEVER be exposed in client-side code in production
- Consider using a backend proxy for API calls in production
- The current implementation uses the secret key in the frontend for simplicity, but this should be moved to a backend service for production use









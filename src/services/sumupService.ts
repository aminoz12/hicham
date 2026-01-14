/**
 * SumUp Checkout Links Service
 * Simple integration using SumUp Checkout Links - no backend required!
 * 
 * SumUp Checkout Links allow you to redirect users directly to a payment page
 * with amount and other details in the URL parameters.
 */

const SUMUP_CHECKOUT_LINKS_URL = 'https://me.sumup.com/checkout-links';

// SumUp credentials
const getSumUpCredentials = () => {
  return {
    merchantId: import.meta.env.VITE_SUMUP_MERCHANT_ID || 'MXQYJZNR',
    publicKey: import.meta.env.VITE_SUMUP_PUBLIC_KEY || 'sup_pk_pduzGQ34gpck2xZeJT6ySGeqiigjUDgBg',
  };
};

export interface SumUpCheckoutLinkParams {
  amount: number;
  currency?: string;
  description?: string;
  merchantCode: string;
  returnUrl?: string;
  reference?: string;
}

/**
 * Generate SumUp Checkout Link URL
 * This creates a direct payment link that users can be redirected to
 * 
 * @param amount - Payment amount
 * @param currency - Currency code (default: EUR)
 * @param description - Payment description
 * @param returnUrl - URL to redirect after payment
 * @param reference - Order reference number
 * @returns SumUp Checkout Link URL
 */
export function generateSumUpCheckoutLink(
  amount: number,
  currency: string = 'EUR',
  description?: string,
  returnUrl?: string,
  reference?: string
): string {
  const credentials = getSumUpCredentials();
  
  // SumUp Checkout Links format:
  // https://me.sumup.com/checkout-links/{merchant_code}?amount={amount}&currency={currency}&description={description}&return_url={return_url}&reference={reference}
  
  const params = new URLSearchParams();
  params.append('amount', amount.toFixed(2));
  params.append('currency', currency);
  
  if (description) {
    params.append('description', description);
  }
  
  if (returnUrl) {
    params.append('return_url', returnUrl);
  }
  
  if (reference) {
    params.append('reference', reference);
  }
  
  const checkoutUrl = `${SUMUP_CHECKOUT_LINKS_URL}/${credentials.merchantId}?${params.toString()}`;
  
  return checkoutUrl;
}

/**
 * Generate a unique checkout reference
 */
export function generateCheckoutReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `HIJABI-${timestamp}-${random}`.toUpperCase();
}

/**
 * Redirect to SumUp Checkout Link
 */
export function redirectToSumUpCheckout(
  amount: number,
  currency: string = 'EUR',
  description?: string,
  returnUrl?: string,
  reference?: string
) {
  const checkoutUrl = generateSumUpCheckoutLink(amount, currency, description, returnUrl, reference);
  window.location.href = checkoutUrl;
}

/**
 * Parse SumUp return URL parameters
 * SumUp redirects back with these parameters:
 * - transaction_code: The transaction ID
 * - status: Payment status (SUCCESSFUL, FAILED, etc.)
 * - amount: The amount paid
 * - currency: Currency code
 */
export function parseSumUpReturnParams(searchParams: URLSearchParams): {
  transactionCode?: string;
  status?: string;
  amount?: string;
  currency?: string;
  reference?: string;
} {
  return {
    transactionCode: searchParams.get('transaction_code') || undefined,
    status: searchParams.get('status') || undefined,
    amount: searchParams.get('amount') || undefined,
    currency: searchParams.get('currency') || undefined,
    reference: searchParams.get('reference') || undefined,
  };
}

/**
 * SumUp Pay Link Service
 * Simple integration using SumUp Pay Links - no backend required!
 * 
 * SumUp Pay Links allow merchants to share a payment link
 * Format: https://sumup.me/{merchant-code}?amount={amount}&currency={currency}
 */

// SumUp credentials - the merchant code from your SumUp profile
const getSumUpMerchantCode = () => {
  return import.meta.env.VITE_SUMUP_MERCHANT_CODE || 'MXQYJZNR';
};

export interface SumUpPayLinkParams {
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  orderId?: string;
}

/**
 * Generate SumUp Pay Link URL
 * 
 * @param amount - Payment amount
 * @param currency - Currency code (default: EUR)
 * @param title - Payment title
 * @param description - Payment description
 * @param orderId - Order reference for tracking
 * @returns SumUp Pay Link URL
 */
export function generateSumUpPayLink(params: SumUpPayLinkParams): string {
  const merchantCode = getSumUpMerchantCode();
  
  // SumUp Pay Link format: https://sumup.me/{merchant-code}
  const baseUrl = `https://sumup.me/${merchantCode}`;
  
  const urlParams = new URLSearchParams();
  
  // Amount is required
  urlParams.append('amount', params.amount.toFixed(2));
  
  // Currency (default EUR)
  if (params.currency) {
    urlParams.append('currency', params.currency);
  }
  
  // Title for the payment
  if (params.title) {
    urlParams.append('title', params.title);
  }
  
  // Description
  if (params.description) {
    urlParams.append('description', params.description);
  }
  
  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Generate a unique order reference
 */
export function generateOrderReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HN-${timestamp}-${random}`;
}

/**
 * Redirect to SumUp Pay Link
 */
export function redirectToSumUpPayment(params: SumUpPayLinkParams) {
  const payLinkUrl = generateSumUpPayLink(params);
  console.log('Redirecting to SumUp Pay Link:', payLinkUrl);
  
  // Open in new tab so user can return to store
  window.open(payLinkUrl, '_blank');
}

/**
 * Legacy functions for backward compatibility
 */
export function generateCheckoutReference(): string {
  return generateOrderReference();
}

export function redirectToSumUpCheckout(
  amount: number,
  currency: string = 'EUR',
  description?: string,
  _returnUrl?: string,
  _reference?: string
) {
  redirectToSumUpPayment({
    amount,
    currency,
    title: 'Hijabi Inoor',
    description
  });
}

export function parseSumUpReturnParams(searchParams: URLSearchParams): {
  transactionCode?: string;
  status?: string;
  amount?: string;
  currency?: string;
  reference?: string;
} {
  return {
    transactionCode: searchParams.get('transaction_code') || searchParams.get('tx_code') || undefined,
    status: searchParams.get('status') || searchParams.get('payment_status') || undefined,
    amount: searchParams.get('amount') || undefined,
    currency: searchParams.get('currency') || undefined,
    reference: searchParams.get('reference') || searchParams.get('order_id') || undefined,
  };
}

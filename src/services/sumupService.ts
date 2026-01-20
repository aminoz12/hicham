/**
 * SumUp Checkout Service
 * Uses Supabase Edge Function to create SumUp Checkout sessions
 * Customers can pay with Credit Card, Apple Pay, Google Pay - NO SumUp account needed!
 */

import { supabase } from '@/lib/supabase';

export interface CheckoutParams {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  redirectUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkout_id?: string;
  checkout_url?: string;
  hosted_checkout_url?: string;
  error?: string;
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
 * Create a SumUp Checkout session via Supabase Edge Function
 * Returns a URL where customers can pay (no SumUp account needed)
 */
export async function createSumUpCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        amount: params.amount,
        currency: params.currency || 'EUR',
        description: params.description || 'Hijabi Inoor Order',
        reference: params.reference || generateOrderReference(),
        redirect_url: params.redirectUrl || `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      console.error('Error creating SumUp checkout:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      checkout_id: data.checkout_id,
      checkout_url: data.checkout_url,
      hosted_checkout_url: data.hosted_checkout_url,
    };
  } catch (error: any) {
    console.error('Error in createSumUpCheckout:', error);
    return { success: false, error: error.message || 'Failed to create checkout' };
  }
}

/**
 * Redirect to SumUp hosted checkout page
 * Customer can pay with Card, Apple Pay, Google Pay
 */
export async function redirectToSumUpCheckout(params: CheckoutParams): Promise<boolean> {
  const result = await createSumUpCheckout(params);
  
  if (result.success && result.hosted_checkout_url) {
    console.log('Redirecting to SumUp Checkout:', result.hosted_checkout_url);
    window.location.href = result.hosted_checkout_url;
    return true;
  }
  
  console.error('Failed to create checkout:', result.error);
  return false;
}

/**
 * Alternative: Open checkout in new tab
 */
export async function openSumUpCheckout(params: CheckoutParams): Promise<boolean> {
  const result = await createSumUpCheckout(params);
  
  if (result.success && result.hosted_checkout_url) {
    console.log('Opening SumUp Checkout:', result.hosted_checkout_url);
    window.open(result.hosted_checkout_url, '_blank');
    return true;
  }
  
  console.error('Failed to create checkout:', result.error);
  return false;
}

// Legacy compatibility
export function generateCheckoutReference(): string {
  return generateOrderReference();
}

export function redirectToSumUpPayment(params: {
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  orderId?: string;
}) {
  return redirectToSumUpCheckout({
    amount: params.amount,
    currency: params.currency,
    description: params.description || params.title,
    reference: params.orderId,
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
    transactionCode: searchParams.get('transaction_code') || searchParams.get('tx_code') || searchParams.get('checkout_id') || undefined,
    status: searchParams.get('status') || searchParams.get('payment_status') || undefined,
    amount: searchParams.get('amount') || undefined,
    currency: searchParams.get('currency') || undefined,
    reference: searchParams.get('reference') || searchParams.get('checkout_reference') || undefined,
  };
}

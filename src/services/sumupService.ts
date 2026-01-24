/**
 * SumUp Hosted Checkout Service
 * Uses Netlify Functions as backend to create SumUp hosted checkouts
 * Customers can pay with Credit Card, Apple Pay, Google Pay - NO SumUp account needed!
 */

export interface PaymentParams {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  customerEmail?: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutId?: string;
  checkoutUrl?: string;
  reference?: string;
  error?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  status: 'success' | 'pending' | 'failed' | 'expired' | 'unknown';
  checkoutId?: string;
  transactionCode?: string;
  reference?: string;
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
 * Create a SumUp Hosted Checkout via Netlify Function
 * Returns the checkout URL to open in a popup
 */
export async function createSumUpCheckout(params: PaymentParams): Promise<CheckoutResult> {
  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'EUR',
        description: params.description,
        reference: params.reference || generateOrderReference(),
        customerEmail: params.customerEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Failed to create checkout:', data);
      return {
        success: false,
        error: data.error || 'Failed to create checkout',
      };
    }

    return {
      success: true,
      checkoutId: data.checkoutId,
      checkoutUrl: data.checkoutUrl,
      reference: data.reference,
    };
  } catch (error: any) {
    console.error('Error creating SumUp checkout:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Open checkout in a popup window (desktop) or full screen (mobile)
 */
export function openCheckoutPopup(checkoutUrl: string): Window | null {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, open in full screen
    window.location.href = checkoutUrl;
    return null;
  }
  
  // On desktop, open in popup
  const width = 500;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  const popup = window.open(
    checkoutUrl,
    'SumUpCheckout',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
  
  return popup;
}

/**
 * Create checkout and redirect to SumUp payment page
 * Main function to call from Checkout page
 */
export async function createCheckoutAndRedirect(params: PaymentParams): Promise<{
  success: boolean;
  popup?: Window | null;
  reference?: string;
  error?: string;
}> {
  // Create the checkout
  const result = await createSumUpCheckout(params);
  
  if (!result.success || !result.checkoutUrl) {
    return {
      success: false,
      error: result.error || 'No checkout URL returned',
    };
  }
  
  // Open the checkout URL
  const popup = openCheckoutPopup(result.checkoutUrl);
  
  return {
    success: true,
    popup,
    reference: result.reference,
  };
}

/**
 * Verify payment status via Netlify Function
 */
export async function verifyPayment(checkoutId: string): Promise<PaymentVerifyResult> {
  try {
    const response = await fetch(`/.netlify/functions/verify-payment?checkoutId=${checkoutId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Failed to verify payment:', data);
      return {
        success: false,
        status: 'unknown',
        error: data.error || 'Failed to verify payment',
      };
    }

    return {
      success: true,
      status: data.status,
      checkoutId: data.checkoutId,
      transactionCode: data.transactionCode,
      reference: data.reference,
    };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      status: 'unknown',
      error: error.message || 'Network error',
    };
  }
}

/**
 * Open WhatsApp with order details
 */
export function openWhatsAppOrder(params: {
  amount: number;
  reference: string;
  items: string;
  customerName?: string;
  customerPhone?: string;
}): void {
  const phoneNumber = '33766043375'; // WhatsApp business number
  
  const message = `🛒 *Nouvelle Commande - HIJABI NOUR*

📋 *Référence:* ${params.reference}

📦 *Articles:*
${params.items}

💰 *Total:* ${params.amount.toFixed(2)} €

👤 *Client:* ${params.customerName || 'Non spécifié'}
📱 *Téléphone:* ${params.customerPhone || 'Non spécifié'}

Merci de confirmer ma commande !`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}

/**
 * SumUp Card Widget Service
 * Uses SumUp's JavaScript SDK with PUBLIC key - no backend needed!
 * Customers can pay with Credit Card directly on your site
 */

// Your SumUp Public Key (starts with sup_pk_)
const getSumUpPublicKey = () => {
  return import.meta.env.VITE_SUMUP_PUBLIC_KEY || 'sup_pk_pduzGQ34gpck2xZeJT6ySGeqiigjUDgBg';
};

// Your SumUp Merchant Code
const getSumUpMerchantCode = () => {
  return import.meta.env.VITE_SUMUP_MERCHANT_CODE || 'MXQYJZNR';
};

export interface PaymentParams {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
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
 * Load SumUp Card Widget SDK
 */
export function loadSumUpSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).SumUpCard) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load SumUp SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize SumUp Card Widget in a container
 * @param containerId - ID of the DOM element to mount the widget
 * @param params - Payment parameters
 * @param onSuccess - Callback when payment succeeds
 * @param onError - Callback when payment fails
 */
export async function initSumUpCardWidget(
  containerId: string,
  params: PaymentParams,
  onSuccess: (result: any) => void,
  onError: (error: any) => void
): Promise<any> {
  try {
    await loadSumUpSDK();

    const SumUpCard = (window as any).SumUpCard;
    
    if (!SumUpCard) {
      throw new Error('SumUp SDK not available');
    }

    const publicKey = getSumUpPublicKey();
    const merchantCode = getSumUpMerchantCode();

    const card = SumUpCard.mount({
      id: containerId,
      publicKey: publicKey,
      merchantCode: merchantCode,
      amount: params.amount,
      currency: params.currency || 'EUR',
      locale: 'fr-FR',
      onResponse: (type: string, body: any) => {
        console.log('SumUp response:', type, body);
        if (type === 'success') {
          onSuccess(body);
        } else if (type === 'error') {
          onError(body);
        }
      },
    });

    return card;
  } catch (error) {
    console.error('Error initializing SumUp Card Widget:', error);
    onError(error);
    throw error;
  }
}

/**
 * Create a direct payment link (opens in new tab)
 * Uses the merchant profile page with pre-filled amount
 */
export function createPaymentLink(params: PaymentParams): string {
  const merchantCode = getSumUpMerchantCode();
  const urlParams = new URLSearchParams();
  
  urlParams.append('amount', params.amount.toFixed(2));
  urlParams.append('currency', params.currency || 'EUR');
  
  if (params.description) {
    urlParams.append('description', params.description);
  }

  // This is the SumUp payment request link format
  return `https://sumup.me/${merchantCode}?${urlParams.toString()}`;
}

/**
 * Open WhatsApp with order details as fallback
 */
export function openWhatsAppOrder(params: PaymentParams & { items?: string }): void {
  const phone = '33600000000'; // Replace with your WhatsApp number
  const message = encodeURIComponent(
    `🛒 Nouvelle commande Hijabi Inoor\n\n` +
    `📦 Référence: ${params.reference || generateOrderReference()}\n` +
    `💰 Total: ${params.amount.toFixed(2)} €\n` +
    `${params.items ? `\n📋 Articles:\n${params.items}` : ''}\n\n` +
    `Je souhaite passer commande.`
  );
  
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Legacy compatibility functions
export function generateCheckoutReference(): string {
  return generateOrderReference();
}

export async function redirectToSumUpCheckout(params: PaymentParams): Promise<boolean> {
  // For now, open the payment link in a new tab
  const link = createPaymentLink(params);
  window.open(link, '_blank');
  return true;
}

export function redirectToSumUpPayment(params: {
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  orderId?: string;
}) {
  const link = createPaymentLink({
    amount: params.amount,
    currency: params.currency,
    description: params.description || params.title,
    reference: params.orderId,
  });
  window.open(link, '_blank');
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
    reference: searchParams.get('reference') || searchParams.get('checkout_reference') || undefined,
  };
}

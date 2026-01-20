import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

/**
 * Netlify Function to create SumUp Hosted Checkout
 * Uses SumUp API with hosted_checkout.enabled = true for guest payments
 */

interface CheckoutRequest {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  customerEmail?: string;
  returnUrl?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Get SumUp API Key from environment
    const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
    const SUMUP_MERCHANT_CODE = process.env.SUMUP_MERCHANT_CODE || "MXQYJZNR";

    if (!SUMUP_API_KEY) {
      console.error("SUMUP_API_KEY not configured");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Payment service not configured" }),
      };
    }

    // Parse request body
    const body: CheckoutRequest = JSON.parse(event.body || "{}");
    const { amount, currency = "EUR", description, reference, customerEmail, returnUrl } = body;

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid amount" }),
      };
    }

    // Generate reference if not provided
    const checkoutReference = reference || `HN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Build return URL
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "https://hijabinour.com";
    const finalReturnUrl = returnUrl || `${siteUrl}/payment/return`;

    // Create SumUp Hosted Checkout
    const checkoutData = {
      checkout_reference: checkoutReference,
      amount: parseFloat(amount.toFixed(2)),
      currency: currency.toUpperCase(),
      merchant_code: SUMUP_MERCHANT_CODE,
      description: description || `Commande Hijabi Inoor - ${checkoutReference}`,
      return_url: `${finalReturnUrl}?reference=${checkoutReference}`,
      // Enable hosted checkout - this is the key for guest payments!
      hosted_checkout: {
        enabled: true,
      },
      // Optional: customer email for receipt
      ...(customerEmail && { customer_email: customerEmail }),
    };

    console.log("Creating SumUp checkout:", JSON.stringify(checkoutData, null, 2));

    // Call SumUp API
    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await response.text();
    console.log("SumUp API response:", response.status, responseText);

    if (!response.ok) {
      console.error("SumUp API error:", response.status, responseText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: "Failed to create checkout", 
          details: responseText 
        }),
      };
    }

    const checkout = JSON.parse(responseText);

    // Get the checkout URL - priority: hosted_checkout_url > links > fallback
    let checkoutUrl = "";
    
    if (checkout.hosted_checkout_url) {
      checkoutUrl = checkout.hosted_checkout_url;
    } else if (checkout.links && checkout.links.length > 0) {
      const link = checkout.links.find((l: any) => l.rel === "redirect" || l.rel === "self");
      if (link) {
        checkoutUrl = link.href;
      }
    }
    
    // Fallback to standard checkout URL
    if (!checkoutUrl && checkout.id) {
      checkoutUrl = `https://checkout.sumup.com/b/${checkout.id}`;
    }

    console.log("Checkout created successfully:", checkout.id, "URL:", checkoutUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkoutId: checkout.id,
        checkoutUrl: checkoutUrl,
        reference: checkoutReference,
      }),
    };
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
    };
  }
};

export { handler };


import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

/**
 * Netlify Function to verify SumUp payment status
 */

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Get checkout ID from query params
    const checkoutId = event.queryStringParameters?.checkoutId;

    if (!checkoutId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing checkoutId parameter" }),
      };
    }

    // Get SumUp API Key from environment
    const SUMUP_API_KEY = process.env.SUMUP_API_KEY;

    if (!SUMUP_API_KEY) {
      console.error("SUMUP_API_KEY not configured");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Payment service not configured" }),
      };
    }

    // Call SumUp API to get checkout status
    const response = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SumUp API error:", response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: "Failed to verify payment", 
          details: errorText 
        }),
      };
    }

    const checkout = await response.json();

    console.log("Checkout status:", checkout.id, checkout.status);

    // Map SumUp status to our status
    let paymentStatus = "unknown";
    switch (checkout.status) {
      case "PAID":
        paymentStatus = "success";
        break;
      case "PENDING":
        paymentStatus = "pending";
        break;
      case "FAILED":
        paymentStatus = "failed";
        break;
      case "EXPIRED":
        paymentStatus = "expired";
        break;
      default:
        paymentStatus = checkout.status?.toLowerCase() || "unknown";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkoutId: checkout.id,
        status: paymentStatus,
        sumupStatus: checkout.status,
        amount: checkout.amount,
        currency: checkout.currency,
        reference: checkout.checkout_reference,
        transactionCode: checkout.transaction_code,
        transactionId: checkout.transaction_id,
      }),
    };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
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





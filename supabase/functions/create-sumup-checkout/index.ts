// Supabase Edge Function to create SumUp checkout (proxy to avoid CORS)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SUMUP_API_URL = 'https://api.sumup.com/v0.1';

// SumUp credentials - should be set as environment variables in Supabase
const SUMUP_MERCHANT_ID = Deno.env.get('SUMUP_MERCHANT_ID') || 'MXQYJZNR';
const SUMUP_SECRET_KEY = Deno.env.get('SUMUP_SECRET_KEY') || 'sup_sk_yB2V2HDFNcLvh4tkOaalv8bN8Sk5EtYls';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { amount, currency, checkout_reference, description, return_url } = await req.json();

    // Validate required fields
    if (!amount || !checkout_reference) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, checkout_reference' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Create SumUp checkout
    const auth = btoa(`${SUMUP_MERCHANT_ID}:${SUMUP_SECRET_KEY}`);
    
    const checkoutData = {
      checkout_reference,
      amount: parseFloat(amount),
      currency: currency || 'EUR',
      merchant_code: SUMUP_MERCHANT_ID,
      description: description || 'Order payment',
      return_url: return_url || `${req.headers.get('origin') || 'http://localhost:3001'}/checkout?checkout_id={checkout_id}&status={status}`,
    };

    const response = await fetch(`${SUMUP_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: errorData.message || `SumUp API error: ${response.statusText}` }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error creating SumUp checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});





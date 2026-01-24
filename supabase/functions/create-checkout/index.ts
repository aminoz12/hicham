// Supabase Edge Function to create SumUp Checkout
// Deploy with: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, description, reference, redirect_url } = await req.json()

    // Validate required fields
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get SumUp API Key from environment
    const SUMUP_API_KEY = Deno.env.get('SUMUP_API_KEY')
    
    if (!SUMUP_API_KEY) {
      console.error('SUMUP_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create SumUp Checkout
    const checkoutResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUMUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: reference || `HN-${Date.now()}`,
        amount: amount,
        currency: currency || 'EUR',
        description: description || 'Hijabi Inoor Order',
        redirect_url: redirect_url || 'https://hijabinour.com/checkout/success',
        return_url: redirect_url || 'https://hijabinour.com/checkout/success',
      }),
    })

    const checkoutData = await checkoutResponse.json()

    if (!checkoutResponse.ok) {
      console.error('SumUp API error:', checkoutData)
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout', details: checkoutData }),
        { status: checkoutResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return the checkout URL for the client to redirect to
    // SumUp hosted checkout page URL
    const checkoutUrl = `https://api.sumup.com/v0.1/checkouts/${checkoutData.id}`
    
    return new Response(
      JSON.stringify({
        success: true,
        checkout_id: checkoutData.id,
        checkout_url: checkoutUrl,
        // For SumUp hosted page, use this URL:
        hosted_checkout_url: `https://checkout.sumup.com/pay/${checkoutData.id}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating checkout:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})




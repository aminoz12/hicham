/**
 * Simple Node.js proxy server for SumUp API (Development only)
 * Run with: npm run proxy
 * 
 * This bypasses CORS issues for local development.
 * For production, use Supabase Edge Functions instead.
 */

import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer';

const app = express();
const PORT = 3002;

// SumUp credentials
const SUMUP_MERCHANT_ID = process.env.SUMUP_MERCHANT_ID || 'MXQYJZNR';
const SUMUP_SECRET_KEY = process.env.SUMUP_SECRET_KEY || 'sup_sk_yB2V2HDFNcLvh4tkOaalv8bN8Sk5EtYls';
const SUMUP_API_URL = 'https://api.sumup.com/v0.1';

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Create SumUp checkout
app.post('/create-checkout', async (req, res) => {
  try {
    const { amount, currency, checkout_reference, description, return_url } = req.body;

    if (!amount || !checkout_reference) {
      return res.status(400).json({ error: 'Missing required fields: amount, checkout_reference' });
    }

    const auth = Buffer.from(`${SUMUP_MERCHANT_ID}:${SUMUP_SECRET_KEY}`).toString('base64');

    const checkoutData = {
      checkout_reference,
      amount: parseFloat(amount),
      currency: currency || 'EUR',
      merchant_code: SUMUP_MERCHANT_ID,
      description: description || 'Order payment',
      return_url: return_url || `http://localhost:3001/checkout?checkout_id={checkout_id}&status={status}`,
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
      return res.status(response.status).json({ error: errorData.message || `SumUp API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating SumUp checkout:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get checkout status
app.get('/checkout-status', async (req, res) => {
  try {
    const { checkout_id } = req.query;

    if (!checkout_id) {
      return res.status(400).json({ error: 'Missing checkout_id parameter' });
    }

    const auth = Buffer.from(`${SUMUP_MERCHANT_ID}:${SUMUP_SECRET_KEY}`).toString('base64');

    const response = await fetch(`${SUMUP_API_URL}/checkouts/${checkout_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.message || `SumUp API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error getting checkout status:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SumUp Proxy Server running on http://localhost:${PORT}`);
  console.log(`📝 Use this URL in your .env.local: VITE_PROXY_URL=http://localhost:${PORT}`);
});


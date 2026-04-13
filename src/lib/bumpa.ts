/**
 * Bumpa Invoice API integration stub.
 * Replace with real Bumpa API calls when API key is configured.
 */

interface BumpaInvoicePayload {
  customer_name: string;
  customer_email: string;
  invoice_number: string;
  line_items: { description: string; qty: number; unit_price: number }[];
  total: number;
  due_date?: string;
}

interface BumpaResult {
  error?: string;
  invoice_id?: string;
  payment_url?: string;
}

export async function createBumpaInvoice(
  payload: BumpaInvoicePayload
): Promise<BumpaResult> {
  const apiKey = process.env.BUMPA_API_KEY;

  if (!apiKey) {
    console.warn('[Bumpa] No API key configured — skipping Bumpa invoice creation.');
    return { error: 'Bumpa API key not configured' };
  }

  try {
    // TODO: Replace with actual Bumpa API endpoint
    const response = await fetch('https://api.bumpa.com/v1/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-Business-Id': process.env.BUMPA_BUSINESS_ID ?? '',
      },
      body: JSON.stringify({
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        reference: payload.invoice_number,
        items: payload.line_items.map((item) => ({
          name: item.description,
          quantity: item.qty,
          price: item.unit_price,
        })),
        total: payload.total,
        due_date: payload.due_date,
      }),
    });

    if (!response.ok) {
      return { error: `Bumpa API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      invoice_id: data.id ?? data.invoice_id,
      payment_url: data.payment_url ?? data.checkout_url,
    };
  } catch (err) {
    console.error('[Bumpa] API call failed:', err);
    return { error: 'Failed to create Bumpa invoice' };
  }
}

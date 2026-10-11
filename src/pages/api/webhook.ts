import type { APIRoute } from 'astro';
import type { WebhookPayload } from '../../lib/paymock';
import { ordersStore } from '../../lib/orders';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = (await request.json().catch(() => null)) as WebhookPayload | null;

    if (!payload || !payload.invoiceId) {
      return new Response(
        JSON.stringify({ error: 'Недійсне тіло вебхука' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PayMock Webhook Received] Invoice: ${payload.invoiceId}, Status: ${payload.status}`);

    // Оновлюємо стан замовлення
    ordersStore.updateStatus(payload.invoiceId, payload.status, payload.paymentInfo);

    // PayMock очікує 200 OK
    return new Response(
      JSON.stringify({ status: 'ok', received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[PayMock Webhook Error]', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Webhook processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

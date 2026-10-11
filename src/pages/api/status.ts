import type { APIRoute } from 'astro';
import { paymock } from '../../lib/paymock';
import { ordersStore } from '../../lib/orders';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const invoiceId = url.searchParams.get('invoiceId');
    const orderId = url.searchParams.get('orderId');

    let resolvedInvoiceId = invoiceId;
    let localOrder = null;

    if (orderId) {
      localOrder = ordersStore.getById(orderId);
      if (localOrder && !resolvedInvoiceId) {
        resolvedInvoiceId = localOrder.invoiceId;
      }
    }

    if (!resolvedInvoiceId) {
      return new Response(
        JSON.stringify({ error: "Параметр 'invoiceId' або 'orderId' обов'язковий" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Запитуємо свіжий статус у PayMock
    const invoiceStatus = await paymock.getInvoiceStatus(resolvedInvoiceId);

    // Оновлюємо статус у локальному реєстрі замовлень
    if (invoiceStatus.status) {
      ordersStore.updateStatus(resolvedInvoiceId, invoiceStatus.status, invoiceStatus.paymentInfo);
    }

    if (!localOrder) {
      localOrder = ordersStore.getByInvoiceId(resolvedInvoiceId);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        invoice: invoiceStatus,
        order: localOrder || null
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[API Status Error]', err);
    return new Response(
      JSON.stringify({
        error: err.message || 'Не вдалося перевірити статус інвойсу'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

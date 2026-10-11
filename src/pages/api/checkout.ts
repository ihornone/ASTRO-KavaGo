import type { APIRoute } from 'astro';
import { paymock, PRODUCTS } from '../../lib/paymock';
import { ordersStore, type OrderRecord } from '../../lib/orders';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return new Response(
        JSON.stringify({ error: 'Порожнє тіло запиту' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const {
      productId,
      quantity = 1,
      customerName = '',
      customerPhone = '',
      customerEmail = '',
      comment = ''
    } = body;

    const product = PRODUCTS[productId];
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Обраний товар не знайдено' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const qty = Math.max(1, Math.min(20, Number(quantity) || 1));
    const totalAmountKopecks = product.amountKopecks * qty;

    const orderRef = `KAVA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const origin = url.origin || 'http://localhost:4321';
    const redirectUrl = `${origin}/order/status`;
    const webHookUrl = `${origin}/api/webhook`;

    // Створюємо інвойс у PayMock
    const invoice = await paymock.createInvoice({
      amount: totalAmountKopecks,
      ccy: 980, // UAH
      validity: 900, // 15 хвилин
      paymentType: 'debit',
      redirectUrl: `${redirectUrl}?orderId=${orderRef}`,
      webHookUrl,
      merchantPaymInfo: {
        reference: orderRef,
        destination: `Оплата замовлення ${orderRef}: ${product.name} (${qty} шт.)`,
        comment: comment ? `${comment} | Покупець: ${customerName} (${customerPhone})` : `Покупець: ${customerName} (${customerPhone})`,
        customerEmails: customerEmail ? [customerEmail] : undefined,
        basketOrder: [
          {
            name: `${product.title} (${product.weight})`,
            qty,
            sum: product.amountKopecks,
            total: totalAmountKopecks,
            code: product.id,
            unit: 'шт.'
          }
        ]
      }
    });

    // Зберігаємо замовлення в локальне сховище
    const orderRecord: OrderRecord = {
      id: orderRef,
      invoiceId: invoice.invoiceId,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.price,
      totalAmount: totalAmountKopecks,
      customerName,
      customerPhone,
      customerEmail,
      comment,
      status: 'created',
      pageUrl: invoice.pageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    ordersStore.save(orderRecord);

    return new Response(
      JSON.stringify({
        ok: true,
        orderId: orderRef,
        invoiceId: invoice.invoiceId,
        pageUrl: invoice.pageUrl
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[API Checkout Error]', err);
    return new Response(
      JSON.stringify({
        error: err.message || 'Не вдалося створити рахунок на оплату'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

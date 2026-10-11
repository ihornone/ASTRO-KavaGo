/**
 * Local in-memory / persistent order registry
 */
import type { InvoiceStatus, PaymentInfo } from './paymock';

export interface OrderRecord {
  id: string; // Order reference e.g. ORD-1728649821-482
  invoiceId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // in UAH
  totalAmount: number; // in kopecks
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  comment?: string;
  status: InvoiceStatus;
  pageUrl: string;
  createdAt: string;
  updatedAt: string;
  paymentInfo?: PaymentInfo;
}

// In-memory registry (persists during process runtime)
const ordersMap = new Map<string, OrderRecord>();

export const ordersStore = {
  save(order: OrderRecord): void {
    ordersMap.set(order.invoiceId, order);
    ordersMap.set(order.id, order);
  },

  getByInvoiceId(invoiceId: string): OrderRecord | undefined {
    return ordersMap.get(invoiceId);
  },

  getById(id: string): OrderRecord | undefined {
    return ordersMap.get(id);
  },

  updateStatus(invoiceId: string, status: InvoiceStatus, paymentInfo?: PaymentInfo): OrderRecord | undefined {
    const existing = ordersMap.get(invoiceId);
    if (!existing) return undefined;
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    if (paymentInfo) {
      existing.paymentInfo = paymentInfo;
    }
    return existing;
  },

  getAll(): OrderRecord[] {
    const unique = new Set<OrderRecord>();
    for (const order of ordersMap.values()) {
      unique.add(order);
    }
    return Array.from(unique);
  }
};

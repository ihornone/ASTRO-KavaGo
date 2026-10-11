/**
 * PayMock API Client & Type Definitions
 * Service: https://paymock.ihornone.site
 */

export interface BasketItem {
  name: string;
  qty: number;
  sum: number; // in kopecks (cents)
  total: number; // in kopecks (cents)
  code?: string;
  icon?: string;
  unit?: string;
}

export interface MerchantPaymInfo {
  reference?: string;
  destination: string;
  comment?: string;
  customerEmails?: string[];
  basketOrder?: BasketItem[];
}

export interface CreateInvoiceRequest {
  amount: number; // in kopecks
  ccy?: number; // ISO 4217, default 980 (UAH)
  merchantPaymInfo?: MerchantPaymInfo;
  redirectUrl?: string;
  webHookUrl?: string;
  validity?: number; // in seconds, default 900
  paymentType?: 'debit' | 'hold';
}

export interface CreateInvoiceResponse {
  invoiceId: string;
  pageUrl: string;
  errCode?: string;
  errText?: string;
}

export type InvoiceStatus =
  | 'created'
  | 'processing'
  | 'hold'
  | 'success'
  | 'failure'
  | 'reversed'
  | 'expired';

export interface PaymentInfo {
  maskedPan?: string;
  approvalCode?: string;
  rrn?: string;
  paymentMethod?: string;
  paymentSystem?: string;
  country?: string;
  fee?: number;
}

export interface InvoiceStatusResponse {
  invoiceId: string;
  status: InvoiceStatus;
  amount: number;
  ccy: number;
  finalAmount?: number;
  createdDate?: string;
  modifiedDate?: string;
  reference?: string;
  destination?: string;
  paymentInfo?: PaymentInfo;
  errCode?: string;
  errText?: string;
}

export interface MerchantDetailsResponse {
  merchantId: string;
  merchantName: string;
  edrpou: string;
  errCode?: string;
  errText?: string;
}

export interface CancelInvoiceRequest {
  invoiceId: string;
  extRef?: string;
  amount?: number;
}

export interface WebhookPayload {
  invoiceId: string;
  status: InvoiceStatus;
  amount: number;
  ccy: number;
  finalAmount?: number;
  createdDate?: string;
  modifiedDate?: string;
  reference?: string;
  destination?: string;
  paymentInfo?: PaymentInfo;
}

export interface CoffeeProduct {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  price: number; // in UAH
  originalPrice?: number; // in UAH
  amountKopecks: number; // in kopecks for PayMock
  weight: string;
  roast: string;
  blend: string;
  image: string;
  accentColor: string;
  buttonBg: string;
  description: string;
  flavorNotes: string[];
}

export const PRODUCTS: Record<string, CoffeeProduct> = {
  'kava-and-go-classic': {
    id: 'kava-and-go-classic',
    name: 'KAVA & GO CLASSIC',
    title: 'Kava & Go Classic 100% Arabica',
    subtitle: '100% Арабіка • Середнє обсмаження • Знижка 15%',
    price: 275,
    originalPrice: 320,
    amountKopecks: 27500,
    weight: '250 г',
    roast: 'Medium',
    blend: '100% Арабіка',
    image: '/images/1st-image.png',
    accentColor: '#8A4B29',
    buttonBg: '#8A4B29',
    description: 'Добірні зерна 100% арабіки дбайливого середнього обсмажування. Глибокий оксамитовий смак з нотами шоколаду та ніжним карамельним посмаком.',
    flavorNotes: ['Шоколад', 'Карамель', 'Горіховий посмак']
  },
  'kava-and-go-hazelnut': {
    id: 'kava-and-go-hazelnut',
    name: 'KAVA & GO HAZELNUT',
    title: 'Kava & Go Hazelnut Arabica',
    subtitle: 'Натуральний фундук • Середнє обсмаження • Знижка 15%',
    price: 290,
    originalPrice: 340,
    amountKopecks: 29000,
    weight: '250 г',
    roast: 'Medium',
    blend: 'Арабіка з фундуком',
    image: '/images/2nd-image.png',
    accentColor: '#4B6144',
    buttonBg: '#4B6144',
    description: 'Вишукана арабіка з багатим теплим ароматом смаженого фундука. Ідеальний вибір для неспішного ранку або заряджаючої кава-паузи.',
    flavorNotes: ['Смажений фундук', 'Прянощі', 'Вершковий баланс']
  }
};

class PayMockClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.PAYMOCK_API_KEY || 'pmk_live_oe1lvq1b1tx9owxdkk4tiqvx';
    this.baseUrl = baseUrl || process.env.PAYMOCK_BASE_URL || 'https://paymock.ihornone.site';
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Token': this.apiKey
    };
  }

  /**
   * Отримати інформацію про поточного мерчанта
   */
  async getMerchantDetails(): Promise<MerchantDetailsResponse> {
    const res = await fetch(`${this.baseUrl}/api/merchant/details`, {
      method: 'GET',
      headers: this.headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.errText || `Failed to fetch merchant details: ${res.status}`);
    }
    return data as MerchantDetailsResponse;
  }

  /**
   * Створити рахунок для оплати (інвойс)
   */
  async createInvoice(params: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    const payload = {
      amount: params.amount,
      ccy: params.ccy ?? 980,
      merchantPaymInfo: params.merchantPaymInfo,
      redirectUrl: params.redirectUrl,
      webHookUrl: params.webHookUrl,
      validity: params.validity ?? 900,
      paymentType: params.paymentType ?? 'debit'
    };

    const res = await fetch(`${this.baseUrl}/api/merchant/invoice/create`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.errText || `Failed to create invoice: ${res.status}`);
    }
    return data as CreateInvoiceResponse;
  }

  /**
   * Отримати поточний статус інвойсу
   */
  async getInvoiceStatus(invoiceId: string): Promise<InvoiceStatusResponse> {
    const url = new URL(`${this.baseUrl}/api/merchant/invoice/status`);
    url.searchParams.set('invoiceId', invoiceId);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.errText || `Failed to get status for invoice ${invoiceId}: ${res.status}`);
    }
    return data as InvoiceStatusResponse;
  }

  /**
   * Скасувати / зробити повернення коштів для сплаченого рахунку
   */
  async cancelInvoice(params: CancelInvoiceRequest): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/merchant/invoice/cancel`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.errText || `Failed to cancel invoice: ${res.status}`);
    }
    return data;
  }

  /**
   * Анулювати несплачений рахунок
   */
  async removeInvoice(invoiceId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/merchant/invoice/remove`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ invoiceId })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.errText || `Failed to remove invoice: ${res.status}`);
    }
    return data;
  }
}

export const paymock = new PayMockClient();

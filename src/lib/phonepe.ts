import crypto from 'crypto';
import { getDb } from './db';

export interface PaymentInitiationResult {
  paymentMode: 'sandbox' | 'direct_upi' | 'phonepe_gateway';
  orderId: number;
  orderNumber: string;
  amount: number;
  phonepeIntentUrl: string;
  genericUpiUrl: string;
  upiId: string;
  upiName: string;
  note: string;
  redirectUrl?: string;
}

export function getPaymentConfig() {
  const db = getDb();
  
  // Read dynamic store settings with env fallbacks
  const upiIdSetting = db.prepare(`SELECT value FROM store_settings WHERE key = 'upi_id'`).get() as { value: string } | undefined;
  const upiNameSetting = db.prepare(`SELECT value FROM store_settings WHERE key = 'upi_name'`).get() as { value: string } | undefined;
  const paymentModeSetting = db.prepare(`SELECT value FROM store_settings WHERE key = 'payment_mode'`).get() as { value: string } | undefined;

  const paymentMode = (paymentModeSetting?.value || process.env.PAYMENT_MODE || 'sandbox') as 'sandbox' | 'direct_upi' | 'phonepe_gateway';
  const upiId = upiIdSetting?.value || process.env.UPI_ID || 'sisterclaymelo@upi';
  const upiName = upiNameSetting?.value || process.env.UPI_NAME || 'ClayMelo Boutique';

  return {
    paymentMode,
    upiId,
    upiName,
    merchantId: process.env.PHONEPE_MERCHANT_ID || '',
    saltKey: process.env.PHONEPE_SALT_KEY || '',
    saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
    env: process.env.PHONEPE_ENV || 'UAT',
  };
}

export function generateUpiIntentUrls(
  orderNumber: string,
  amount: number,
  upiId: string,
  upiName: string
) {
  const transactionNote = `ClayMelo Order ${orderNumber}`;
  const encodedNote = encodeURIComponent(transactionNote);
  const encodedName = encodeURIComponent(upiName);
  const formattedAmount = amount.toFixed(2);

  // PhonePe specific direct intent URI
  const phonepeIntentUrl = `phonepe://pay?pa=${upiId}&pn=${encodedName}&am=${formattedAmount}&tn=${encodedNote}&cu=INR`;
  
  // Universal standard UPI intent URI (works with PhonePe, GPay, Paytm, etc.)
  const genericUpiUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${formattedAmount}&tn=${encodedNote}&cu=INR`;

  return {
    phonepeIntentUrl,
    genericUpiUrl,
    transactionNote,
  };
}

export function validateUtrNumber(utr: string): boolean {
  if (!utr) return false;
  const cleaned = utr.trim();
  // Valid UPI transaction reference / UTR is typically 12 digits
  return /^\d{12}$/.test(cleaned);
}

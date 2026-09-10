import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getPaymentConfig, generateUpiIntentUrls } from '@/lib/phonepe';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    const config = getPaymentConfig();
    const { phonepeIntentUrl, genericUpiUrl, transactionNote } = generateUpiIntentUrls(
      order.order_number,
      order.total_amount,
      config.upiId,
      config.upiName
    );

    // Record payment initiation
    const existingPayment = db.prepare(`SELECT id FROM payments WHERE order_id = ? AND status = 'INITIATED'`).get(order.id);
    if (!existingPayment) {
      db.prepare(`
        INSERT INTO payments (order_id, payment_gateway, amount, status)
        VALUES (?, 'PHONEPE_UPI', ?, 'INITIATED')
      `).run(order.id, order.total_amount);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total_amount,
      paymentMode: config.paymentMode,
      upiId: config.upiId,
      upiName: config.upiName,
      phonepeIntentUrl,
      genericUpiUrl,
      transactionNote,
    });
  } catch (err: any) {
    console.error('Payment initiation error:', err);
    return NextResponse.json({ error: 'Could not initiate payment' }, { status: 500 });
  }
}

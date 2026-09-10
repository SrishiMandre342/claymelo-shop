import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getPaymentConfig, validateUtrNumber } from '@/lib/phonepe';

export async function POST(req: NextRequest) {
  try {
    const { orderId, utrNumber, simulateSuccess } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'PAID') {
      return NextResponse.json({ success: true, message: 'Order is already marked as paid' });
    }

    const config = getPaymentConfig();

    // Handling Sandbox / Developer Mode simulation
    if (config.paymentMode === 'sandbox' || simulateSuccess) {
      // Transition to PAID
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'PAID', order_status = 'PROCESSING'
        WHERE id = ?
      `).run(order.id);

      const generatedUtr = utrNumber || `SANDBOX${Date.now().toString().slice(-6)}`;
      db.prepare(`
        UPDATE payments 
        SET status = 'SUCCESS', utr_number = ?, verified_at = datetime('now')
        WHERE order_id = ?
      `).run(generatedUtr, order.id);

      // Decrement inventory stock safely
      const items = db.prepare(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`).all(order.id) as any[];
      for (const item of items) {
        if (item.product_id) {
          db.prepare(`
            UPDATE products 
            SET stock = MAX(0, stock - ?) 
            WHERE id = ?
          `).run(item.quantity, item.product_id);
        }
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
      });
    }

    // Direct UPI mode with real UTR submission
    if (!utrNumber || !validateUtrNumber(utrNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid 12-digit UPI Reference Number / UTR.' },
        { status: 400 }
      );
    }

    const cleanedUtr = utrNumber.trim();

    // Check if this UTR has already been claimed for another order
    const duplicateUtr = db.prepare(`
      SELECT id, order_id FROM payments 
      WHERE utr_number = ? AND order_id != ? AND status = 'SUCCESS'
    `).get(cleanedUtr, order.id);

    if (duplicateUtr) {
      return NextResponse.json(
        { error: 'This UPI Reference Number has already been submitted for another order.' },
        { status: 400 }
      );
    }

    // Record submission and set order to PAYMENT_PROCESSING (Awaiting admin verification or bank webhook)
    db.prepare(`
      UPDATE payments 
      SET utr_number = ?, status = 'VERIFICATION_PENDING'
      WHERE order_id = ?
    `).run(cleanedUtr, order.id);

    db.prepare(`
      UPDATE orders 
      SET payment_status = 'VERIFICATION_PENDING', order_status = 'PAYMENT_PROCESSING'
      WHERE id = ?
    `).run(order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentStatus: 'VERIFICATION_PENDING',
      orderStatus: 'PAYMENT_PROCESSING',
      message: 'Payment reference submitted. Your order will be verified shortly!',
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}

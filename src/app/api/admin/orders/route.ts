import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const db = getDb();

    let query = `
      SELECT 
        o.*,
        p.utr_number,
        p.status as payment_record_status,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (status && status !== 'ALL') {
      query += ` AND o.order_status = ?`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC`;

    const orders = db.prepare(query).all(...params) as any[];

    // Calculate metrics
    const totalOrders = db.prepare(`SELECT COUNT(*) as count FROM orders`).get() as any;
    const paidOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE payment_status = 'PAID'`).get() as any;
    const pendingOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE payment_status != 'PAID'`).get() as any;
    const totalSales = db.prepare(`SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE payment_status = 'PAID'`).get() as any;
    const totalProducts = db.prepare(`SELECT COUNT(*) as count FROM products`).get() as any;

    return NextResponse.json({
      orders,
      metrics: {
        totalOrders: totalOrders.count,
        paidOrders: paidOrders.count,
        pendingOrders: pendingOrders.count,
        totalSales: totalSales.sum,
        totalProducts: totalProducts.count,
      }
    });
  } catch (err: any) {
    console.error('Admin orders fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderId, orderStatus, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(`SELECT id, payment_status FROM orders WHERE id = ?`).get(orderId) as any;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (orderStatus) {
      updates.push('order_status = ?');
      params.push(orderStatus);
    }

    if (paymentStatus) {
      updates.push('payment_status = ?');
      params.push(paymentStatus);

      // If transitioning to PAID, update payments record & decrement inventory if not already decremented
      if (paymentStatus === 'PAID' && order.payment_status !== 'PAID') {
        db.prepare(`
          UPDATE payments 
          SET status = 'SUCCESS', verified_at = datetime('now') 
          WHERE order_id = ?
        `).run(orderId);

        const items = db.prepare(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`).all(orderId) as any[];
        for (const item of items) {
          if (item.product_id) {
            db.prepare(`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).run(item.quantity, item.product_id);
          }
        }
      }
    }

    if (updates.length > 0) {
      params.push(orderId);
      db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin update order error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

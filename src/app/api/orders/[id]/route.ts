import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();
    const user = await getCurrentUser();

    const isNum = /^\d+$/.test(id);
    const whereClause = isNum ? 'o.id = ?' : 'o.order_number = ?';
    const queryParam = isNum ? parseInt(id, 10) : id;

    const order = db.prepare(`
      SELECT 
        o.*
      FROM orders o
      WHERE ${whereClause}
    `).get(queryParam) as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security: If order belongs to an authenticated user, only that user or an admin can access it
    if (order.user_id && (!user || (user.id !== order.user_id && user.role !== 'admin'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const items = db.prepare(`
      SELECT 
        id,
        product_id,
        product_name,
        price_at_purchase,
        quantity,
        image_url
      FROM order_items
      WHERE order_id = ?
    `).all(order.id);

    const payment = db.prepare(`
      SELECT 
        payment_gateway,
        transaction_ref,
        utr_number,
        amount,
        status,
        created_at,
        verified_at
      FROM payments
      WHERE order_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(order.id);

    let address = null;
    try {
      address = JSON.parse(order.address_json);
    } catch {
      address = order.address_json;
    }

    return NextResponse.json({
      order: {
        ...order,
        address,
        items,
        payment,
      },
    });
  } catch (err: any) {
    console.error('Fetch order detail error:', err);
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}

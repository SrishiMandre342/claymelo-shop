import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!user && !sessionId) {
      return NextResponse.json({ items: [], subtotal: 0 });
    }

    const db = getDb();
    let query = `
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.original_price,
        p.stock,
        p.is_available,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, display_order ASC 
          LIMIT 1
        ) as image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE 
    `;

    let params: any[] = [];
    if (user) {
      query += `c.user_id = ?`;
      params.push(user.id);
    } else {
      query += `c.session_id = ?`;
      params.push(sessionId);
    }

    const items = db.prepare(query).all(...params) as any[];

    // Calculate subtotal from current server-side prices
    const subtotal = items.reduce((sum, item) => {
      if (item.is_available && item.stock > 0) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    return NextResponse.json({ items, subtotal });
  } catch (err: any) {
    console.error('Cart fetch error:', err);
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { productId, quantity = 1, sessionId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();

    // Verify product exists and check stock
    const product = db.prepare(`SELECT id, stock, is_available FROM products WHERE id = ?`).get(productId) as any;
    if (!product || !product.is_available || product.stock < 1) {
      return NextResponse.json({ error: 'This product is currently unavailable.' }, { status: 400 });
    }

    const targetQty = Math.min(Math.max(1, quantity), product.stock);

    if (user) {
      const existing = db.prepare(`SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`).get(user.id, productId) as any;
      if (existing) {
        db.prepare(`UPDATE cart_items SET quantity = ?, created_at = datetime('now') WHERE id = ?`).run(targetQty, existing.id);
      } else {
        db.prepare(`INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`).run(user.id, productId, targetQty);
      }
    } else if (sessionId) {
      const existing = db.prepare(`SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ?`).get(sessionId, productId) as any;
      if (existing) {
        db.prepare(`UPDATE cart_items SET quantity = ?, created_at = datetime('now') WHERE id = ?`).run(targetQty, existing.id);
      } else {
        db.prepare(`INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)`).run(sessionId, productId, targetQty);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Cart add error:', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cartItemId');
    const sessionId = searchParams.get('sessionId');

    if (!cartItemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const db = getDb();
    if (user) {
      db.prepare(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`).run(cartItemId, user.id);
    } else if (sessionId) {
      db.prepare(`DELETE FROM cart_items WHERE id = ? AND session_id = ?`).run(cartItemId, sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Cart delete error:', err);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}

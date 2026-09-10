import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const db = getDb();
    const items = db.prepare(`
      SELECT 
        w.id as wishlist_item_id,
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
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(user.id);

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('Wishlist fetch error:', err);
    return NextResponse.json({ error: 'Failed to load wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to save to your wishlist' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare(`SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?`).get(user.id, productId);

    let saved = false;
    if (existing) {
      db.prepare(`DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`).run(user.id, productId);
      saved = false;
    } else {
      db.prepare(`INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)`).run(user.id, productId);
      saved = true;
    }

    return NextResponse.json({ success: true, saved });
  } catch (err: any) {
    console.error('Wishlist toggle error:', err);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

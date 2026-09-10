import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();

    // Support both numeric id and slug
    const isNum = /^\d+$/.test(id);
    const whereClause = isNum ? 'p.id = ?' : 'p.slug = ?';
    const queryParam = isNum ? parseInt(id, 10) : id;

    const product = db.prepare(`
      SELECT 
        p.id, 
        p.name, 
        p.slug, 
        p.description, 
        p.price, 
        p.original_price, 
        p.stock, 
        p.is_available, 
        p.is_featured, 
        p.created_at,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `).get(queryParam) as any;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = db.prepare(`
      SELECT id, image_url, is_primary, display_order 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, display_order ASC
    `).all(product.id);

    return NextResponse.json({
      product: {
        ...product,
        images: images.length > 0 ? images : [{ id: 0, image_url: '/placeholder-clay.svg', is_primary: 1 }],
      },
    });
  } catch (err: any) {
    console.error('Fetch product detail error:', err);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const availability = searchParams.get('availability');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'featured';

    const db = getDb();

    let query = `
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
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, display_order ASC 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (category && category !== 'all') {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)`;
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term);
    }

    if (availability === 'available') {
      query += ` AND p.is_available = 1 AND p.stock > 0`;
    }

    if (featured === '1' || featured === 'true') {
      query += ` AND p.is_featured = 1`;
    }

    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      case 'featured':
      default:
        query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
        break;
    }

    const products = db.prepare(query).all(...params);

    // Also fetch categories for easy filter bar population
    const categories = db.prepare(`SELECT id, name, slug FROM categories ORDER BY name ASC`).all();

    return NextResponse.json({ products, categories });
  } catch (err: any) {
    console.error('Fetch products error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    const products = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, display_order ASC 
          LIMIT 1
        ) as primary_image,
        (
          SELECT COUNT(*) 
          FROM product_images 
          WHERE product_id = p.id
        ) as image_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `).all();

    const categories = db.prepare(`SELECT * FROM categories ORDER BY name ASC`).all();

    return NextResponse.json({ products, categories });
  } catch (err: any) {
    console.error('Admin products fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      originalPrice,
      stock,
      categoryId,
      isFeatured,
      isAvailable,
      images, // array of image url strings
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: 'Product name and price are required' }, { status: 400 });
    }

    const db = getDb();

    // Generate URL friendly slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'product';

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const insert = db.prepare(`
      INSERT INTO products (
        name, slug, description, price, original_price, stock,
        is_available, is_featured, category_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      slug,
      (description || '').trim(),
      parseFloat(price),
      originalPrice ? parseFloat(originalPrice) : null,
      parseInt(stock || '1', 10),
      isAvailable ? 1 : 0,
      isFeatured ? 1 : 0,
      categoryId ? parseInt(categoryId, 10) : null
    );

    const productId = Number(result.lastInsertRowid);

    // Save images
    if (images && Array.isArray(images) && images.length > 0) {
      const insertImg = db.prepare(`
        INSERT INTO product_images (product_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, ?)
      `);

      images.forEach((url: string, idx: number) => {
        insertImg.run(productId, url, idx === 0 ? 1 : 0, idx);
      });
    }

    return NextResponse.json({ success: true, productId, slug });
  } catch (err: any) {
    console.error('Admin create product error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      originalPrice,
      stock,
      categoryId,
      isFeatured,
      isAvailable,
      images,
    } = body;

    if (!id || !name || price === undefined) {
      return NextResponse.json({ error: 'Product ID, name and price are required' }, { status: 400 });
    }

    const db = getDb();

    db.prepare(`
      UPDATE products 
      SET 
        name = ?,
        description = ?,
        price = ?,
        original_price = ?,
        stock = ?,
        is_available = ?,
        is_featured = ?,
        category_id = ?
      WHERE id = ?
    `).run(
      name.trim(),
      (description || '').trim(),
      parseFloat(price),
      originalPrice ? parseFloat(originalPrice) : null,
      parseInt(stock || '0', 10),
      isAvailable ? 1 : 0,
      isFeatured ? 1 : 0,
      categoryId ? parseInt(categoryId, 10) : null,
      id
    );

    // Update images if provided
    if (images && Array.isArray(images)) {
      db.prepare(`DELETE FROM product_images WHERE product_id = ?`).run(id);
      const insertImg = db.prepare(`
        INSERT INTO product_images (product_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, ?)
      `);

      images.forEach((url: string, idx: number) => {
        insertImg.run(id, url, idx === 0 ? 1 : 0, idx);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin update product error:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM products WHERE id = ?`).run(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin delete product error:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

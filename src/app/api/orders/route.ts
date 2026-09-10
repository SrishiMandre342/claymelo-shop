import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateShipping } from '@/lib/shipping';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      items,
      notes,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !deliveryAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please fill in all required customer and delivery details.' }, { status: 400 });
    }

    const { flatHouse, street, city, state, pincode } = deliveryAddress;
    if (!flatHouse || !street || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Please provide complete delivery address details.' }, { status: 400 });
    }

    const db = getDb();

    // Verify all products, fetch current database prices and check stock
    let subtotal = 0;
    const validatedItems: Array<{
      productId: number;
      productName: string;
      price: number;
      quantity: number;
      imageUrl: string;
    }> = [];

    for (const reqItem of items) {
      const product = db.prepare(`
        SELECT 
          p.id, 
          p.name, 
          p.price, 
          p.stock, 
          p.is_available,
          (
            SELECT image_url 
            FROM product_images 
            WHERE product_id = p.id 
            ORDER BY is_primary DESC, display_order ASC 
            LIMIT 1
          ) as image_url
        FROM products p 
        WHERE p.id = ?
      `).get(reqItem.productId) as any;

      if (!product || !product.is_available) {
        return NextResponse.json(
          { error: `"${product?.name || 'A selected item'}" is currently unavailable.` },
          { status: 400 }
        );
      }

      if (product.stock < reqItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, parseInt(reqItem.quantity, 10));
      subtotal += product.price * qty;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty,
        imageUrl: product.image_url || '/placeholder-clay.svg',
      });
    }

    // Backend-calculated shipping charge
    const shippingCalc = calculateShipping(state, city, pincode, subtotal);
    const shippingFee = shippingCalc.shippingFee;
    const totalAmount = subtotal + shippingFee;

    // Generate human-friendly order number: e.g. CM-260909-8421
    const orderNumber = `CM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create order transaction
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_phone, customer_email,
        address_json, subtotal, shipping_fee, total_amount, payment_method,
        payment_status, order_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PHONEPE_UPI', 'PENDING', 'PENDING_PAYMENT', ?)
    `);

    const result = insertOrder.run(
      orderNumber,
      user ? user.id : null,
      customerName.trim(),
      customerPhone.trim(),
      customerEmail.trim().toLowerCase(),
      JSON.stringify(deliveryAddress),
      subtotal,
      shippingFee,
      totalAmount,
      notes ? notes.trim() : null
    );

    const orderId = Number(result.lastInsertRowid);

    // Insert order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of validatedItems) {
      insertOrderItem.run(
        orderId,
        item.productId,
        item.productName,
        item.price,
        item.quantity,
        item.imageUrl
      );
    }

    // If user is logged in, optionally save address
    if (user && body.saveAddress) {
      const existingAddr = db.prepare(`SELECT id FROM addresses WHERE user_id = ? AND pincode = ? AND flat_house = ?`).get(user.id, pincode, flatHouse);
      if (!existingAddr) {
        db.prepare(`
          INSERT INTO addresses (user_id, recipient_name, phone, flat_house, street, area, city, state, pincode)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(user.id, customerName, customerPhone, flatHouse, street, deliveryAddress.area || '', city, state, pincode);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      subtotal,
      shippingFee,
      totalAmount,
      ruleMatched: shippingCalc.ruleMatched,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Could not create order. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const db = getDb();
    const orders = db.prepare(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.subtotal,
        o.shipping_fee,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.created_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT image_url FROM order_items WHERE order_id = o.id LIMIT 1) as preview_image
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(user.id);

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('Fetch orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

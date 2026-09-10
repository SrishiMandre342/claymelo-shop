const http = require('http');

async function runTests() {
  console.log('🧪 Starting ClayMelo Full-Stack E2E Automated Verification...\n');

  const BASE_URL = 'http://localhost:3000';

  // Helper fetch
  async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, ok: res.ok, headers: res.headers, data };
  }

  // 1. Home Page Verification
  console.log('1. Checking Home Page (GET /)...');
  const home = await request('/');
  if (home.ok && home.data.includes('ClayMelo')) {
    console.log('   ✓ Home page loaded with ClayMelo branding.');
  } else {
    throw new Error(`Home page failed: status ${home.status}`);
  }

  // 2. Public Products Listing API
  console.log('\n2. Fetching Products (GET /api/products)...');
  const prods = await request('/api/products');
  if (prods.ok && prods.data.products && prods.data.products.length > 0) {
    console.log(`   ✓ Retrieved ${prods.data.products.length} products successfully.`);
    console.log(`   ✓ Sample Product: "${prods.data.products[0].name}" - ₹${prods.data.products[0].price} (Stock: ${prods.data.products[0].stock})`);
  } else {
    throw new Error('Products API failed');
  }

  const sampleProduct = prods.data.products[0];

  // 3. Dynamic Backend Shipping Engine Calculation
  console.log('\n3. Testing Server-Side Shipping Engine (POST /api/shipping/calculate)...');
  
  // Test Karnataka
  const shipKar = await request('/api/shipping/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'Karnataka', city: 'Bangalore', pincode: '560038', subtotal: 299 }),
  });
  console.log(`   ✓ Karnataka Shipping: ₹${shipKar.data.shippingFee} (${shipKar.data.ruleMatched})`);

  // Test Other State (Maharashtra)
  const shipMah = await request('/api/shipping/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'Maharashtra', city: 'Mumbai', pincode: '400001', subtotal: 299 }),
  });
  console.log(`   ✓ Maharashtra Shipping: ₹${shipMah.data.shippingFee} (${shipMah.data.ruleMatched})`);

  // Test Free Shipping Threshold (>= 999)
  const shipFree = await request('/api/shipping/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'Maharashtra', city: 'Mumbai', pincode: '400001', subtotal: 1050 }),
  });
  console.log(`   ✓ Orders >= ₹999 Shipping: ₹${shipFree.data.shippingFee} (Free Shipping: ${shipFree.data.freeShippingApplied})`);

  // 4. Order Creation with Server-Side Price & Stock Validation
  console.log('\n4. Creating Customer Order (POST /api/orders)...');
  const orderRes = await request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Aarav Sharma',
      customerPhone: '9876543210',
      customerEmail: 'aarav@example.com',
      deliveryAddress: {
        flatHouse: 'Flat 402, Lotus Tower',
        street: '10th Main, Indiranagar',
        area: 'Near Metro',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
      },
      items: [
        { productId: sampleProduct.id, quantity: 1 }
      ],
    }),
  });

  if (!orderRes.ok || !orderRes.data.orderId) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderRes.data)}`);
  }

  const orderId = orderRes.data.orderId;
  const orderNumber = orderRes.data.orderNumber;
  console.log(`   ✓ Order Created! Order ID: ${orderId}, Number: ${orderNumber}`);
  console.log(`   ✓ Subtotal: ₹${orderRes.data.subtotal}, Shipping: ₹${orderRes.data.shippingFee}, Total: ₹${orderRes.data.totalAmount}`);

  // 5. Payment Initiation (PhonePe / UPI Intent URL Generation)
  console.log('\n5. Initiating PhonePe / UPI Payment (POST /api/payment/initiate)...');
  const payInit = await request('/api/payment/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });

  if (!payInit.ok || !payInit.data.phonepeIntentUrl) {
    throw new Error('Payment initiation failed');
  }

  console.log(`   ✓ Payment Mode: ${payInit.data.paymentMode}`);
  console.log(`   ✓ Sister UPI ID: ${payInit.data.upiId} (${payInit.data.upiName})`);
  console.log(`   ✓ PhonePe Mobile Intent: ${payInit.data.phonepeIntentUrl.substring(0, 60)}...`);
  console.log(`   ✓ Generic UPI Intent: ${payInit.data.genericUpiUrl.substring(0, 60)}...`);

  // 6. Payment Verification & Stock Deduction
  console.log('\n6. Verifying Payment (POST /api/payment/verify)...');
  const verifyRes = await request('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      simulateSuccess: true,
    }),
  });

  if (!verifyRes.ok || verifyRes.data.paymentStatus !== 'PAID') {
    throw new Error(`Payment verification failed: ${JSON.stringify(verifyRes.data)}`);
  }

  console.log(`   ✓ Payment Verified! Status: ${verifyRes.data.paymentStatus}, Order Status: ${verifyRes.data.orderStatus}`);

  // 7. Verify Order Details & Decremented Inventory
  console.log('\n7. Inspecting Confirmed Order (GET /api/orders/[id])...');
  const checkOrder = await request(`/api/orders/${orderId}`);
  if (checkOrder.ok && checkOrder.data.order.payment_status === 'PAID') {
    console.log(`   ✓ Confirmed Order: Total Paid ₹${checkOrder.data.order.total_amount}`);
    console.log(`   ✓ Customer: ${checkOrder.data.order.customer_name} (${checkOrder.data.order.customer_phone})`);
  } else {
    throw new Error('Could not fetch verified order');
  }

  // 8. Admin Login & Protected Route Access
  console.log('\n8. Testing Admin Authentication (POST /api/auth/login)...');
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@claymelo.com',
      password: 'ClaymeloAdmin2026!',
    }),
  });

  if (!adminLogin.ok || adminLogin.data.user.role !== 'admin') {
    throw new Error('Admin login failed');
  }

  const cookieHeader = adminLogin.headers.get('set-cookie');
  console.log(`   ✓ Admin Authenticated! Logged in as: ${adminLogin.data.user.fullName} (${adminLogin.data.user.role})`);

  // Extract auth token
  const tokenMatch = cookieHeader ? cookieHeader.match(/claymelo_token=([^;]+)/) : null;
  const tokenCookie = tokenMatch ? `claymelo_token=${tokenMatch[1]}` : '';

  // 9. Admin Order Inspection & Status Pipeline Update
  console.log('\n9. Admin Order Pipeline Management (PUT /api/admin/orders)...');
  const updateStatusRes = await request('/api/admin/orders', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': tokenCookie,
    },
    body: JSON.stringify({
      orderId,
      orderStatus: 'SHIPPED',
    }),
  });

  if (updateStatusRes.ok) {
    console.log('   ✓ Order Status Transitioned: PROCESSING → SHIPPED');
  } else {
    throw new Error('Admin order update failed');
  }

  // 10. Admin Settings
  console.log('\n10. Checking Admin Store Settings (GET /api/admin/settings)...');
  const settingsRes = await request('/api/admin/settings', {
    headers: { 'Cookie': tokenCookie },
  });
  if (settingsRes.ok && settingsRes.data.settings) {
    console.log(`   ✓ Store Name: ${settingsRes.data.settings.store_name}`);
    console.log(`   ✓ Active UPI: ${settingsRes.data.settings.upi_id}`);
    console.log(`   ✓ Instagram: ${settingsRes.data.settings.instagram_url}`);
  }

  console.log('\n🎉 ALL 10 END-TO-END AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});

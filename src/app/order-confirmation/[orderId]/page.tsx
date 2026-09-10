'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order confirmation', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Confirming your handcrafted order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '64px 16px', maxWidth: '500px' }}>
        <div className="empty-state">
          <h3>Order Details Not Found</h3>
          <p>We couldn't retrieve the details for this order.</p>
          <Link href="/orders" className="btn btn-primary">Go to My Orders</Link>
        </div>
      </div>
    );
  }

  const addr = order.address || {};

  return (
    <div className="container" style={{ padding: '36px 16px 64px 16px', maxWidth: '640px' }}>
      {/* Success Badge Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-pink)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 24px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          backgroundColor: '#ECFDF5',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}>
          <CheckCircle2 size={40} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          marginBottom: '8px',
        }}>
          Order Placed Successfully! 🍄
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
          Thank you for supporting handmade art! We will pack your clay pieces with love and care.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--color-pink-50)',
          border: '1px solid var(--border-pink)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.88rem',
          fontWeight: '600',
          color: 'var(--color-pink-800)',
        }}>
          <span>Order ID:</span>
          <strong>{order.order_number}</strong>
        </div>
      </div>

      {/* Order Details Summary Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
          Items Purchased ({order.items?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.items?.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={item.image_url || '/placeholder-clay.svg'}
                alt=""
                style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
                  {item.product_name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Qty: {item.quantity} × ₹{item.price_at_purchase}
                </span>
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                ₹{item.price_at_purchase * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.88rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
            <span>Items Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
            <span>Shipping</span>
            <span>{order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--color-gray-900)',
            fontWeight: '700',
            fontSize: '1.05rem',
            paddingTop: '6px',
          }}>
            <span>Total Paid</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>

        {/* Delivery Details */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px',
          fontSize: '0.86rem',
        }}>
          <h4 style={{ fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '6px' }}>
            Shipping to:
          </h4>
          <p style={{ color: 'var(--color-gray-700)', lineHeight: '1.5' }}>
            <strong>{order.customer_name}</strong> ({order.customer_phone})<br />
            {addr.flatHouse}, {addr.street}{addr.area ? `, ${addr.area}` : ''}<br />
            {addr.city}, {addr.state} - {addr.pincode}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/orders" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
          <Package size={18} /> View My Orders
        </Link>
        <Link href="/shop" className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, ShieldCheck, MapPin } from 'lucide-react';

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving order tracking info...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '64px 16px' }}>
        <div className="empty-state">
          <h3>Order not found</h3>
          <Link href="/orders" className="btn btn-primary">Back to My Orders</Link>
        </div>
      </div>
    );
  }

  const addr = order.address || {};
  const isPaid = order.payment_status === 'PAID';
  const isProcessing = order.order_status === 'PROCESSING' || isPaid;
  const isShipped = order.order_status === 'SHIPPED';
  const isDelivered = order.order_status === 'DELIVERED';

  return (
    <div className="container" style={{ padding: '24px 16px 64px 16px', maxWidth: '780px' }}>
      <Link href="/orders" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '16px',
      }}>
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            Order #{order.order_number}
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        {/* If pending payment, allow clicking to pay */}
        {order.payment_status !== 'PAID' && (
          <Link href={`/payment/${order.id}`} className="btn btn-primary">
            Complete Payment →
          </Link>
        )}
      </div>

      {/* Order Status Timeline Tracker */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '20px' }}>
          Order Progress
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          position: 'relative',
        }}>
          {/* Step 1: Placed */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={20} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>Order Placed</span>
          </div>

          {/* Step 2: Payment / Verified */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isPaid ? '#ECFDF5' : 'var(--color-pink-50)',
              color: isPaid ? '#059669' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isPaid ? <CheckCircle2 size={20} /> : <Clock size={20} />}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
              {isPaid ? 'Payment Confirmed' : 'Awaiting Payment'}
            </span>
          </div>

          {/* Step 3: Baking & Handcrafting */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isShipped || isDelivered ? '#ECFDF5' : (isProcessing ? 'var(--color-pink-100)' : 'var(--color-gray-100)'),
              color: isShipped || isDelivered ? '#059669' : (isProcessing ? 'var(--primary)' : 'var(--color-gray-400)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={20} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>Handcrafting</span>
          </div>

          {/* Step 4: Shipped & Delivered */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isDelivered ? '#ECFDF5' : (isShipped ? '#EFF6FF' : 'var(--color-gray-100)'),
              color: isDelivered ? '#059669' : (isShipped ? '#1D4ED8' : 'var(--color-gray-400)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Truck size={20} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
              {isDelivered ? 'Delivered' : (isShipped ? 'Shipped' : 'Delivery')}
            </span>
          </div>
        </div>
      </div>

      {/* Items & Pricing Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '16px' }}>
          Items in this Order
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {order.items?.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={item.image_url || '/placeholder-clay.svg'}
                alt=""
                style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
                  {item.product_name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Qty: {item.quantity} × ₹{item.price_at_purchase}
                </span>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                ₹{item.price_at_purchase * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          marginTop: '16px',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.88rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
            <span>Subtotal</span>
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
            <span>Total Amount</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address & Payment Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {/* Shipping Address */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--primary)" /> Delivery Address
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-gray-700)', lineHeight: '1.6' }}>
            <strong>{order.customer_name}</strong><br />
            Phone: {order.customer_phone}<br />
            {addr.flatHouse}, {addr.street}{addr.area ? `, ${addr.area}` : ''}<br />
            {addr.city}, {addr.state} - {addr.pincode}
          </p>
        </div>

        {/* Payment Record */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--primary)" /> Payment Information
          </h3>
          <div style={{ fontSize: '0.86rem', color: 'var(--color-gray-700)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Method: <strong>PhonePe / UPI</strong></div>
            <div>Status: <strong>{order.payment_status}</strong></div>
            {order.payment?.utr_number && (
              <div>UTR / Ref: <strong style={{ letterSpacing: '0.04em' }}>{order.payment.utr_number}</strong></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

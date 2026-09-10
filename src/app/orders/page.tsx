'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, ChevronRight, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function MyOrdersPage() {
  const { user } = useShop();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  const getStatusBadge = (orderStatus: string, paymentStatus: string) => {
    if (orderStatus === 'DELIVERED') {
      return <span className="badge-pill badge-green">Delivered ✓</span>;
    }
    if (orderStatus === 'SHIPPED') {
      return <span className="badge-pill" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>Shipped 🚚</span>;
    }
    if (orderStatus === 'PROCESSING') {
      return <span className="badge-pill badge-pink">Baking & Packing 🎨</span>;
    }
    if (paymentStatus === 'PAID') {
      return <span className="badge-pill badge-green">Paid</span>;
    }
    return <span className="badge-pill" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>Payment Pending</span>;
  };

  return (
    <div className="container" style={{ padding: '32px 16px 64px 16px', maxWidth: '780px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          My Orders <Package size={26} color="var(--primary)" />
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Track and view your handmade clay order history.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders placed yet. 🍄</h3>
          <p>Treat yourself or a friend to handcrafted keychains and boutique clay art.</p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
              }}
              className="order-card-link"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={order.preview_image || '/placeholder-clay.svg'}
                  alt=""
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    backgroundColor: '#F9FAFB',
                    flexShrink: 0,
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-gray-900)', fontSize: '0.95rem' }}>
                      {order.order_number}
                    </span>
                    {getStatusBadge(order.order_status, order.payment_status)}
                  </div>

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                  </span>

                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginTop: '2px' }}>
                    ₹{order.total_amount}
                  </span>
                </div>
              </div>

              <div style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .order-card-link:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
}

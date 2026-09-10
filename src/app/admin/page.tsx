'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Truck,
  Settings
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        if (data.orders) {
          setRecentOrders(data.orders.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Welcome & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            Dashboard Overview 🍄
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Welcome back! Here is how your ClayMelo shop is performing today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/products" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
            <PlusCircle size={16} /> Add New Clay Art
          </Link>
          <Link href="/admin/orders" className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
            View Orders
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {/* Total Sales */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Revenue
            </span>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            ₹{metrics.totalSales}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600' }}>
            From paid PhonePe & UPI orders
          </span>
        </div>

        {/* Total Orders */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Orders
            </span>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-pink-50)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            {metrics.totalOrders}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {metrics.paidOrders} confirmed • {metrics.pendingOrders} pending
          </span>
        </div>

        {/* Paid Orders */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Paid & Ready
            </span>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            {metrics.paidOrders}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: '600' }}>
            Awaiting packing & dispatch
          </span>
        </div>

        {/* Products in Store */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Products Listed
            </span>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-pink-50)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            {metrics.totalProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Active catalog items
          </span>
        </div>
      </div>

      {/* Quick Setup Modules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        <Link href="/admin/products" style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-pink-100)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Package size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
              Manage Products & Photos
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Upload photos of your clay creations, update prices and adjust stock
            </p>
          </div>
        </Link>

        <Link href="/admin/shipping" style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Truck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
              Configure Shipping
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Set rates for Karnataka, other states, and free delivery thresholds
            </p>
          </div>
        </Link>

        <Link href="/admin/settings" style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Settings size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
              Store & UPI Settings
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Configure your sister's UPI ID, phone number, and Instagram bio link
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Overview */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
            Recent Customer Orders
          </h2>
          <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '16px 0', textAlign: 'center' }}>
            No orders placed yet. Orders from customers will appear here!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 8px' }}>Order #</th>
                  <th style={{ padding: '10px 8px' }}>Customer</th>
                  <th style={{ padding: '10px 8px' }}>Amount</th>
                  <th style={{ padding: '10px 8px' }}>Payment</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>{ord.order_number}</td>
                    <td style={{ padding: '12px 8px' }}>{ord.customer_name}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '700' }}>₹{ord.total_amount}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`badge-pill ${ord.payment_status === 'PAID' ? 'badge-green' : 'badge-gray'}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className="badge-pill badge-pink">{ord.order_status}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Link href="/admin/orders" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.82rem' }}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

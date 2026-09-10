'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' ? '/api/admin/orders' : `/api/admin/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetail = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.order) {
        setSelectedOrder(data.order);
      }
    } catch (err) {
      alert('Could not fetch order details');
    }
  };

  const handleUpdateStatus = async (orderId: number, newOrderStatus: string, newPaymentStatus?: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (res.ok) {
        await loadOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          await openOrderDetail(orderId);
        }
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      alert('Network error while updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge-pill badge-green">Delivered</span>;
      case 'SHIPPED':
        return <span className="badge-pill" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>Shipped</span>;
      case 'PROCESSING':
        return <span className="badge-pill badge-pink">Processing</span>;
      case 'CANCELLED':
        return <span className="badge-pill" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>Cancelled</span>;
      case 'PAYMENT_PROCESSING':
        return <span className="badge-pill" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>UTR Submitted</span>;
      default:
        return <span className="badge-pill badge-gray">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.75rem',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
        }}>
          Customer Orders 🍄
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Inspect orders, verify UPI transaction references, and dispatch packages.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['ALL', 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: '600',
              backgroundColor: statusFilter === st ? 'var(--primary)' : '#ffffff',
              color: statusFilter === st ? '#ffffff' : 'var(--color-gray-700)',
              border: statusFilter === st ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              whiteSpace: 'nowrap',
            }}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '8px' }}>No orders found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              No customer orders match the selected filter.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--color-gray-50)',
                  borderBottom: '1px solid var(--border-color)',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <th style={{ padding: '12px 16px' }}>Order #</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Payment</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                      {ord.order_number}
                      {ord.utr_number && (
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--primary)' }}>
                          UTR: {ord.utr_number}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-gray-900)' }}>{ord.customer_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ord.customer_phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                      ₹{ord.total_amount}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge-pill ${ord.payment_status === 'PAID' ? 'badge-green' : 'badge-gray'}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getOrderStatusBadge(ord.order_status)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => openOrderDetail(ord.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                      >
                        <Eye size={14} /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                  Order #{selectedOrder.order_number}
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ color: 'var(--color-gray-400)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Control Bar */}
            <div style={{
              backgroundColor: 'var(--color-pink-50)',
              border: '1px solid var(--border-pink)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-pink-800)', textTransform: 'uppercase' }}>
                Update Order Pipeline Status:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedOrder.payment_status !== 'PAID' && (
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING', 'PAID')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: '#059669' }}
                  >
                    <Check size={14} /> Verify Payment (Mark Paid)
                  </button>
                )}

                <button
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Mark Processing
                </button>

                <button
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <Truck size={14} /> Mark Shipped
                </button>

                <button
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <CheckCircle size={14} /> Mark Delivered
                </button>

                <button
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626',
                    backgroundColor: '#FEF2F2',
                  }}
                >
                  Cancel Order
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div style={{
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.88rem',
            }}>
              <h4 style={{ fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                Customer & Shipping Details
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>{selectedOrder.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-700)' }}>
                <Phone size={14} /> {selectedOrder.customer_phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-700)' }}>
                <Mail size={14} /> {selectedOrder.customer_email}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--color-gray-700)', marginTop: '4px' }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {selectedOrder.address?.flatHouse}, {selectedOrder.address?.street}{selectedOrder.address?.area ? `, ${selectedOrder.address.area}` : ''}<br />
                  {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                </span>
              </div>
            </div>

            {/* Payment Record */}
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.86rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <h4 style={{ fontWeight: '700', color: 'var(--color-gray-900)' }}>Payment Information</h4>
              <div>Method: <strong>PhonePe / UPI</strong></div>
              <div>Status: <strong>{selectedOrder.payment_status}</strong></div>
              {selectedOrder.payment?.utr_number && (
                <div style={{ color: 'var(--primary)', fontWeight: '700' }}>
                  Customer Submitted UTR: {selectedOrder.payment.utr_number}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h4 style={{ fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '10px' }}>
                Ordered Clay Art Items
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                    <img
                      src={it.image_url || '/placeholder-clay.svg'}
                      alt=""
                      style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: '600' }}>{it.product_name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        Qty: {it.quantity} × ₹{it.price_at_purchase}
                      </div>
                    </div>
                    <div style={{ fontWeight: '700' }}>
                      ₹{it.price_at_purchase * it.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                marginTop: '12px',
                paddingTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.86rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
                  <span>Shipping Fee</span>
                  <span>₹{selectedOrder.shipping_fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', paddingTop: '4px' }}>
                  <span>Final Total</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

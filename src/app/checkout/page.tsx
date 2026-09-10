'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, ArrowRight, AlertCircle } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartSubtotal, user, loadingUser, refreshCart } = useShop();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [loadingUser, user, router]);

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Address fields
  const [flatHouse, setFlatHouse] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);

  // Dynamic shipping state from backend
  const [shippingFee, setShippingFee] = useState<number>(49);
  const [shippingRuleMatched, setShippingRuleMatched] = useState<string>('State rate (Karnataka)');
  const [calculatingShipping, setCalculatingShipping] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Synchronize user if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Recalculate shipping on backend whenever state, city, or pincode changes
  useEffect(() => {
    async function updateShipping() {
      if (!cartSubtotal || cartSubtotal <= 0) return;
      try {
        setCalculatingShipping(true);
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state,
            city,
            pincode,
            subtotal: cartSubtotal,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShippingFee(data.shippingFee);
          setShippingRuleMatched(data.ruleMatched);
        }
      } catch (err) {
        console.error('Shipping calculation failed', err);
      } finally {
        setCalculatingShipping(false);
      }
    }

    const timer = setTimeout(updateShipping, 300);
    return () => clearTimeout(timer);
  }, [state, city, pincode, cartSubtotal]);

  if (loadingUser || !user) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Redirecting to login...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 16px', maxWidth: '500px' }}>
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Please add items to your cart before proceeding to checkout.</p>
          <Link href="/shop" className="btn btn-primary">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const finalTotal = cartSubtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Please fill in your name, phone, and email.');
      return;
    }

    if (!flatHouse.trim() || !street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMsg('Please complete all delivery address fields.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit postal pincode.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: {
          flatHouse: flatHouse.trim(),
          street: street.trim(),
          area: area.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: 'India',
        },
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
        })),
        saveAddress: !!saveAddress,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to place order. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success: Redirect to payment page
      router.push(`/payment/${data.orderId}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const indianStates = [
    'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra', 'Delhi',
    'Andhra Pradesh', 'Telangana', 'Goa', 'Gujarat', 'Haryana',
    'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Punjab', 'Madhya Pradesh',
    'Odisha', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
    'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Uttarakhand'
  ];

  return (
    <div className="container" style={{ padding: '24px 16px 64px 16px', maxWidth: '1050px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/cart" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}>
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
        }}>
          Secure Checkout 🍄
        </h1>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#B91C1C',
          fontSize: '0.9rem',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Left Column: Customer & Delivery Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Customer Contact */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
              marginBottom: '16px',
            }}>
              1. Customer Information
            </h2>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="For order updates"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
              marginBottom: '16px',
            }}>
              2. Delivery Address
            </h2>

            <div className="form-group">
              <label className="form-label">House / Flat / Building *</label>
              <input
                type="text"
                required
                value={flatHouse}
                onChange={(e) => setFlatHouse(e.target.value)}
                placeholder="e.g. Flat 302, Rosewood Apts"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street / Colony *</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 5th Main, Indiranagar"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Landmark / Area (Optional)</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Near Metro Station"
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit PIN"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-select"
              >
                {indianStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {user && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-gray-700)', marginTop: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Save this address for future purchases
              </label>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Pricing Breakdown */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'sticky',
          top: '90px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            Order Summary ({cartItems.length} items)
          </h2>

          {/* Mini Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {cartItems.map((item) => (
              <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
                <img
                  src={item.image_url || '/placeholder-clay.svg'}
                  alt=""
                  style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', color: 'var(--color-gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Qty: {item.quantity} × ₹{item.price}
                  </div>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--color-gray-900)' }}>
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculation Breakdown */}
          <div style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.92rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-700)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '600' }}>₹{cartSubtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-700)' }}>
              <span>
                Shipping Charge
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({calculatingShipping ? 'Calculating...' : shippingRuleMatched})
                </span>
              </span>
              <span style={{ fontWeight: '600', color: shippingFee === 0 ? '#059669' : 'var(--color-gray-900)' }}>
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                Final Total
              </span>
              <span style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--color-gray-900)',
              }}>
                ₹{finalTotal}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: '8px' }}
          >
            {submitting ? 'Creating Order...' : (
              <>
                Proceed to Payment <ArrowRight size={18} />
              </>
            )}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            <ShieldCheck size={16} color="var(--primary)" />
            Official PhonePe & UPI Intent / QR Payment
          </div>
        </div>
      </form>
    </div>
  );
}

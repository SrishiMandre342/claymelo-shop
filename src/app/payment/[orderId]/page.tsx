'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Copy, Check, Smartphone, QrCode, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import UpiQrCode from '@/components/UpiQrCode';
import { useShop } from '@/context/ShopContext';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { refreshCart } = useShop();

  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function initPayment() {
      try {
        setLoading(true);
        const res = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (res.ok) {
          setPaymentData(data);
        } else {
          setErrorMsg(data.error || 'Failed to initiate payment');
        }
      } catch (err) {
        setErrorMsg('Network error. Could not connect to payment service.');
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      initPayment();
    }
  }, [orderId]);

  const handleCopyUpi = () => {
    if (!paymentData?.upiId) return;
    navigator.clipboard.writeText(paymentData.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyPhone = () => {
    const ph = paymentData?.phone || '9380340087';
    navigator.clipboard.writeText(ph);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleVerifyPayment = async (simulate = false) => {
    setErrorMsg('');
    setStatusMessage('');

    if (!simulate) {
      if (!utrNumber.trim()) {
        setErrorMsg('Please enter the 12-digit UPI Reference / UTR number from your payment receipt.');
        return;
      }
      if (!/^\d{12}$/.test(utrNumber.trim())) {
        setErrorMsg('Invalid UPI Reference Number. A standard UPI UTR is exactly 12 digits.');
        return;
      }
    }

    setVerifying(true);

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          utrNumber: utrNumber.trim(),
          simulateSuccess: simulate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Payment verification failed. Please check your reference number.');
        setVerifying(false);
        return;
      }

      // Refresh cart to clear completed items
      await refreshCart();

      // Redirect to order confirmation
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      setErrorMsg('Failed to communicate with payment verification server. Please try again.');
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Setting up secure PhonePe / UPI payment request...</p>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="container" style={{ padding: '64px 16px', maxWidth: '500px' }}>
        <div className="empty-state">
          <h3>Payment Unavailable</h3>
          <p>{errorMsg || 'Unable to load payment details for this order.'}</p>
          <button onClick={() => router.push('/orders')} className="btn btn-primary">
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const isSandbox = paymentData.paymentMode === 'sandbox';

  return (
    <div className="container" style={{ padding: '32px 16px 64px 16px', maxWidth: '640px' }}>
      {/* Title & Order Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-pink-50)',
          color: 'var(--color-pink-700)',
          fontSize: '0.8rem',
          fontWeight: '600',
          marginBottom: '10px',
        }}>
          <ShieldCheck size={14} /> 100% Secure UPI / PhonePe
        </div>

        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          marginBottom: '6px',
        }}>
          Complete Your Payment 🍄
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Order #{paymentData.orderNumber}
        </p>
      </div>

      {/* Amount Payable Highlight Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-pink)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Total Amount Payable
        </span>
        <div style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '2.5rem',
          fontWeight: '800',
          color: 'var(--color-gray-900)',
          margin: '4px 0 12px 0',
        }}>
          ₹{paymentData.amount}
        </div>

        {/* Developer / Sandbox Mode Banner */}
        {isSandbox && (
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            color: '#92400E',
            textAlign: 'left',
          }}>
            <strong>🛠️ Developer Test Mode Active:</strong> Payment gateway is running in test mode. You can test the mobile PhonePe intent below or click the instant simulation button.
          </div>
        )}

        {/* Mobile PhonePe Direct Intent Trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href={paymentData.phonepeIntentUrl}
            className="btn btn-primary btn-lg btn-full"
            style={{
              backgroundColor: '#5f259f', // Official PhonePe brand purple
              boxShadow: '0 4px 14px rgba(95, 37, 159, 0.3)',
            }}
          >
            <Smartphone size={18} /> Pay with PhonePe / UPI App
          </a>

          <a
            href={paymentData.genericUpiUrl}
            className="btn btn-secondary btn-full"
            style={{ fontSize: '0.9rem' }}
          >
            <ExternalLink size={16} /> Choose UPI App (GPay / Paytm / BHIM)
          </a>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          fontSize: '0.78rem',
          color: '#64748B',
          textAlign: 'left',
          lineHeight: '1.45',
        }}>
          💡 <strong>Security Note:</strong> UPI rules automatically decline transactions if the sender tries to pay their own registered UPI ID. Please pay from a customer bank account or scan the QR code below.
        </div>
      </div>

      {/* QR Code and Manual UPI ID Fallback Box */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <QrCode size={18} color="var(--primary)" /> Desktop Scan & UPI Details
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <UpiQrCode value={paymentData.genericUpiUrl} size={180} />

          {/* Securely fetched sister's UPI ID copy box */}
          <div style={{
            width: '100%',
            backgroundColor: 'var(--color-gray-50)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                Store UPI ID ({paymentData.upiName})
              </span>
              <strong style={{ color: 'var(--color-gray-900)' }}>{paymentData.upiId}</strong>
            </div>
            <button
              onClick={handleCopyUpi}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: copiedUpi ? '#ECFDF5' : '#ffffff',
                color: copiedUpi ? '#059669' : 'var(--color-gray-700)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              {copiedUpi ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          {/* Securely fetched sister's PhonePe Mobile Number box */}
          {paymentData.phone && (
            <div style={{
              width: '100%',
              backgroundColor: 'var(--color-gray-50)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.88rem',
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                  PhonePe / GPay Mobile Number ({paymentData.upiName})
                </span>
                <strong style={{ color: 'var(--color-gray-900)' }}>{paymentData.phone}</strong>
              </div>
              <button
                onClick={handleCopyPhone}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: copiedPhone ? '#ECFDF5' : '#ffffff',
                  color: copiedPhone ? '#059669' : 'var(--color-gray-700)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                {copiedPhone ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Verification Step */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          marginBottom: '8px',
        }}>
          Verify Payment & Confirm Order
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          After paying, enter the 12-digit UPI Reference Number / UTR from your PhonePe or bank SMS to confirm your order.
        </p>

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '14px',
            color: '#B91C1C',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">12-Digit UPI Reference Number (UTR)</label>
          <input
            type="text"
            maxLength={12}
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 423456789012"
            className="form-input"
            style={{ letterSpacing: '0.08em', fontWeight: '600', fontSize: '1rem' }}
          />
        </div>

        <button
          onClick={() => handleVerifyPayment(false)}
          disabled={verifying || utrNumber.length !== 12}
          className="btn btn-primary btn-lg btn-full"
        >
          {verifying ? 'Verifying with Bank...' : (
            <>
              Confirm Payment <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Sandbox instant simulation button for development/testing */}
        {isSandbox && (
          <button
            onClick={() => handleVerifyPayment(true)}
            disabled={verifying}
            className="btn btn-outline btn-full"
            style={{ marginTop: '12px', borderColor: 'var(--warning)', color: '#B45309', fontSize: '0.85rem' }}
          >
            ⚡ Test Mode: Simulate Successful Payment Instantly
          </button>
        )}
      </div>
    </div>
  );
}

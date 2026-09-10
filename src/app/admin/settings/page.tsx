'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Check, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: 'ClayMelo 🍄',
    store_tagline: 'Handmade clay creations, made with love.',
    upi_id: 'sisterclaymelo@upi',
    upi_name: 'ClayMelo Boutique',
    instagram_url: 'https://www.instagram.com/random_artz2/',
    contact_phone: '+91 98765 43210',
    contact_email: 'hello@claymelo.com',
    payment_mode: 'sandbox',
    is_store_active: '1',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        setErrorMsg('Failed to save settings');
      }
    } catch (err) {
      setErrorMsg('Network error while saving settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.75rem',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Store & UPI Settings ⚙️
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Configure your PhonePe / UPI payment details, store branding, and Instagram bio links.
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          color: '#065F46',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Check size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          color: '#B91C1C',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Payment & UPI Details Box */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-pink)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
              PhonePe & UPI Configuration
            </h2>
          </div>

          <div className="form-group">
            <label className="form-label">Active Payment Mode</label>
            <select
              value={settings.payment_mode || 'sandbox'}
              onChange={(e) => handleChange('payment_mode', e.target.value)}
              className="form-select"
            >
              <option value="sandbox">🛠️ Sandbox / Test Mode (Instant verification test)</option>
              <option value="direct_upi">📱 Direct UPI Mode (Sister's UPI ID + UTR Verification)</option>
              <option value="phonepe_gateway">⚡ Official PhonePe Merchant Gateway</option>
            </select>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Choose <strong>Direct UPI Mode</strong> to accept payments into your sister's UPI ID. Customers will open PhonePe, send payment, and submit the 12-digit UTR.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">UPI ID (e.g. Sister's UPI) *</label>
              <input
                type="text"
                required
                value={settings.upi_id || ''}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                placeholder="e.g. sistername@okaxis"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">UPI Payee Display Name</label>
              <input
                type="text"
                value={settings.upi_name || ''}
                onChange={(e) => handleChange('upi_name', e.target.value)}
                placeholder="e.g. ClayMelo Boutique"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Store Profile & Social Links */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '16px' }}>
            Brand Identity & Instagram Link
          </h2>

          <div className="form-group">
            <label className="form-label">Store Brand Name</label>
            <input
              type="text"
              value={settings.store_name || ''}
              onChange={(e) => handleChange('store_name', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input
              type="text"
              value={settings.store_tagline || ''}
              onChange={(e) => handleChange('store_tagline', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instagram Shop URL</label>
            <input
              type="url"
              value={settings.instagram_url || ''}
              onChange={(e) => handleChange('instagram_url', e.target.value)}
              placeholder="https://www.instagram.com/random_artz2/"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Support Phone</label>
              <input
                type="text"
                value={settings.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support Email</label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Admin Account Settings */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '16px' }}>
            Admin Account & Login Credentials
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Admin Name</label>
              <input
                type="text"
                value={settings.admin_name || 'Prithvi Mandre'}
                onChange={(e) => handleChange('admin_name', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Login Email</label>
              <input
                type="email"
                value={settings.admin_email || ''}
                onChange={(e) => handleChange('admin_email', e.target.value)}
                placeholder="your.email@example.com"
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                You can change this to your email now, or your sister's email anytime.
              </span>
            </div>
          </div>
        </div>

        {/* Store Active Status */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.is_store_active === '1'}
              onChange={(e) => handleChange('is_store_active', e.target.checked ? '1' : '0')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            Store Active (Accepting customer orders)
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary btn-lg"
          style={{ alignSelf: 'flex-start' }}
        >
          {submitting ? 'Saving Settings...' : (
            <>
              <Save size={18} /> Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}

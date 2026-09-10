'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Plus, Trash2, Check, AlertCircle, Save } from 'lucide-react';

export default function AdminShippingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [freeThreshold, setFreeThreshold] = useState('999');
  const [loading, setLoading] = useState(true);

  // New Rule Form
  const [ruleType, setRuleType] = useState('state');
  const [ruleValue, setRuleValue] = useState('');
  const [rate, setRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadShippingConfig();
  }, []);

  const loadShippingConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shipping');
      const data = await res.json();
      if (data.rules) setRules(data.rules);
      if (data.freeShippingThreshold !== undefined) {
        setFreeThreshold(String(data.freeShippingThreshold));
      }
    } catch (err) {
      console.error('Failed to load shipping config', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFreeThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeShippingThreshold: parseFloat(freeThreshold || '0'),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      alert('Could not update free shipping threshold');
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ruleValue.trim() || !rate) {
      setErrorMsg('Please specify the location rule and rate.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleType,
          ruleValue: ruleValue.trim(),
          rate: parseFloat(rate),
        }),
      });

      if (res.ok) {
        setRuleValue('');
        setRate('');
        await loadShippingConfig();
      } else {
        setErrorMsg('Failed to add rule');
      }
    } catch (err) {
      setErrorMsg('Network error while adding rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shipping rule?')) return;
    try {
      const res = await fetch(`/api/admin/shipping?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadShippingConfig();
      }
    } catch (err) {
      alert('Could not delete rule');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      {/* Top Title */}
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
          Shipping Management 🚚
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Configure dynamic location-based rates for Karnataka, pan-India states, and specific pincodes.
        </p>
      </div>

      {/* Free Shipping Setting Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '8px' }}>
          Free Shipping Threshold
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Orders with items subtotal equal to or exceeding this amount automatically receive FREE shipping.
        </p>

        <form onSubmit={handleUpdateFreeThreshold} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹</span>
            <input
              type="number"
              min="0"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              className="form-input"
              style={{ width: '130px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
            {saveSuccess ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Update Threshold</>}
          </button>
        </form>
      </div>

      {/* Add New Rule Form Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '16px' }}>
          Add Location Shipping Rule
        </h3>

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

        <form onSubmit={handleAddRule} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rule Target</label>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
              className="form-select"
            >
              <option value="state">By State (e.g. Karnataka)</option>
              <option value="city">By City (e.g. Bangalore)</option>
              <option value="pincode">By Exact Pincode (e.g. 560001)</option>
              <option value="default">Store Default Fallback</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location Name / Code</label>
            <input
              type="text"
              required={ruleType !== 'default'}
              value={ruleType === 'default' ? 'All other locations' : ruleValue}
              onChange={(e) => setRuleValue(e.target.value)}
              disabled={ruleType === 'default'}
              placeholder={ruleType === 'pincode' ? 'e.g. 560001' : 'e.g. Karnataka'}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Shipping Rate (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 49"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ height: '42px' }}
          >
            <Plus size={16} /> Add Rule
          </button>
        </form>
      </div>

      {/* Existing Rules Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
            Active Shipping Rules ({rules.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            Loading rules...
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
                }}>
                  <th style={{ padding: '12px 16px' }}>Rule Type</th>
                  <th style={{ padding: '12px 16px' }}>Location / Rule Value</th>
                  <th style={{ padding: '12px 16px' }}>Charge</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge-pill badge-pink" style={{ textTransform: 'capitalize' }}>
                        {r.rule_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {r.rule_value}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                      ₹{r.rate}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        style={{ color: '#DC2626', padding: '4px 8px' }}
                        title="Delete rule"
                      >
                        <Trash2 size={16} />
                      </button>
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

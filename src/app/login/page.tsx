'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (user) {
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/account');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid credentials. Please try again.');
        setSubmitting(false);
        return;
      }

      // Check role
      if (data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please check your network.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '48px 16px 80px 16px', maxWidth: '440px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 28px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🍄</span>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.6rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
            marginBottom: '6px',
          }}>
            Welcome to ClayMelo
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Sign in with your account credentials
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#B91C1C',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-gray-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: '6px' }}
          >
            {submitting ? 'Logging in...' : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.86rem',
          color: 'var(--color-gray-600)',
        }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

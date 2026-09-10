'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, loadingUser, logout } = useShop();

  if (loadingUser) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading account profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '64px 16px', maxWidth: '480px' }}>
        <div className="empty-state">
          <h3>Sign In to Your Account</h3>
          <p>Track your orders, view saved items, and manage addresses.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary">Login</Link>
            <Link href="/register" className="btn btn-secondary">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 16px 64px 16px', maxWidth: '640px' }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-pink-100)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          fontWeight: '700',
        }}>
          {user.fullName.charAt(0).toUpperCase()}
        </div>

        <div style={{ flexGrow: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.35rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {user.fullName}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {user.email}
          </p>
        </div>
      </div>

      {/* Account Navigation Grid */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Link
          href="/orders"
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: 'var(--color-gray-900)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={20} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>My Orders</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>View purchase history & order status</div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--color-gray-400)" />
        </Link>

        <Link
          href="/wishlist"
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: 'var(--color-gray-900)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={20} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Saved Wishlist</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your favorite clay art pieces</div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--color-gray-400)" />
        </Link>

        <button
          onClick={logout}
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            color: '#DC2626',
            fontWeight: '600',
            fontSize: '0.92rem',
            textAlign: 'left',
          }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/random_artz2/');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.instagram_url) {
          setInstagramUrl(data.settings.instagram_url);
        }
      })
      .catch(() => {});
  }, []);

  // Hide customer footer on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
      padding: '48px 0 24px 0',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '36px',
        }}>
          {/* Brand & Story */}
          <div>
            <div style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.35rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ClayMelo <span style={{ fontSize: '1.1rem' }}>🍄</span>
            </div>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '16px',
            }}>
              Handcrafted clay art & boutique keychains. Every piece is sculpted with patience, detail, and love to bring a little everyday joy into your world.
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-pink-50)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: '1px solid var(--border-pink)',
              }}
            >
              <Instagram size={16} />
              Follow @random_artz2
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}>
              Shop Collections
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <Link href="/shop" style={{ color: 'var(--text-muted)' }}>All Creations</Link>
              <Link href="/shop?category=keychains" style={{ color: 'var(--text-muted)' }}>Clay Keychains</Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}>
              Customer Help
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <Link href="/orders" style={{ color: 'var(--text-muted)' }}>Track My Order</Link>
              <Link href="/cart" style={{ color: 'var(--text-muted)' }}>View Cart</Link>
              <Link href="/wishlist" style={{ color: 'var(--text-muted)' }}>My Wishlist</Link>
              <span style={{ color: 'var(--text-muted)' }}>UPI & PhonePe Accepted</span>
              <span style={{ color: 'var(--text-muted)' }}>Safe Delivery Pan-India</span>
            </div>
          </div>

          {/* Handcrafted Promise */}
          <div>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}>
              Artisan Promise
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
              100% handcrafted original designs. Baked at optimal temperatures and triple-varnished for durability and water resistance.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--color-pink-700)',
              fontWeight: '600',
            }}>
              <Sparkles size={14} /> Packed safely in eco-friendly bubble boxes
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--color-gray-500)',
        }}>
          <div>
            © {new Date().getFullYear()} ClayMelo 🍄. Handcrafted with love.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--color-gray-400)', fontSize: '0.78rem' }}>
              Handmade in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

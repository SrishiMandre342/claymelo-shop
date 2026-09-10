'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, Menu, X, Shield, Search } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount, wishlistCount, user } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide customer header on admin routes for a clean dedicated admin workspace
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/', isActive: pathname === '/' },
    { name: 'Shop', href: user ? '/shop' : '/login?redirect=/shop', isActive: pathname.startsWith('/shop') },
  ];

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div style={{
        backgroundColor: 'var(--color-pink-50)',
        borderBottom: '1px solid var(--border-pink)',
        padding: '6px 12px',
        textAlign: 'center',
        fontSize: '0.8rem',
        fontWeight: '500',
        color: 'var(--color-pink-800)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span>🍄 Free shipping on all handmade orders above ₹999!</span>
      </div>

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}>
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '8px',
                color: 'var(--color-gray-700)',
              }}
              className="mobile-only-btn"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.45rem',
                fontWeight: '700',
                color: 'var(--color-gray-900)',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ClayMelo <span style={{ fontSize: '1.25rem' }}>🍄</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {navLinks.map((link) => {
              const isActive = link.isActive;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? 'var(--primary)' : 'var(--color-gray-700)',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                    padding: '4px 0',
                  }}
                >
                  {link.name}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '2px'
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Action Icons (Search, Wishlist, Cart, User) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href={user ? "/shop" : "/login?redirect=/shop"}
              aria-label="Search art"
              style={{
                color: 'var(--color-gray-700)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
              }}
            >
              <Search size={20} />
            </Link>

            <Link
              href={user ? "/wishlist" : "/login?redirect=/wishlist"}
              aria-label="Wishlist"
              style={{
                position: 'relative',
                color: 'var(--color-gray-700)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
              }}
            >
              <Heart size={21} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  minWidth: '17px',
                  height: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href={user ? "/cart" : "/login?redirect=/cart"}
              aria-label="Shopping Cart"
              style={{
                position: 'relative',
                color: 'var(--color-gray-700)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
              }}
            >
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  minWidth: '17px',
                  height: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href={user ? '/account' : '/login'}
              aria-label="Account"
              style={{
                color: 'var(--color-gray-700)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px',
              }}
            >
              <User size={21} />
              {user && (
                <span style={{ fontSize: '0.82rem', fontWeight: '600' }} className="desktop-only-text">
                  {user.fullName.split(' ')[0]}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '104px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 99,
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '80%',
            maxWidth: '300px',
            height: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              fontWeight: '700',
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-pink-700)',
              fontSize: '1.1rem'
            }}>
              ClayMelo Boutique 🍄
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-800)',
                  padding: '8px 0',
                }}
              >
                {link.name}
              </Link>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)', padding: '6px 0' }}
              >
                My Orders
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)', padding: '6px 0' }}
              >
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-only-text {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

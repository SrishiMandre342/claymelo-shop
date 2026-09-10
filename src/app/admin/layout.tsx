'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loadingUser, logout } = useShop();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loadingUser && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loadingUser, router]);

  if (loadingUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        fontFamily: 'var(--font-family-base)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🍄</span>
          <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products & Art', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Shipping Rules', href: '/admin/shipping', icon: Truck },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Admin Sidebar for Desktop */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }} className="admin-sidebar">
        {/* Sidebar Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '1.4rem' }}>🍄</span>
          <div>
            <div style={{
              fontFamily: 'var(--font-family-display)',
              fontWeight: '700',
              fontSize: '1.15rem',
              color: 'var(--color-gray-900)',
            }}>
              ClayMelo Admin
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-pink-700)', fontWeight: '600' }}>
              Handmade Boutique Manager
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '600' : '500',
                  backgroundColor: isActive ? 'var(--color-pink-50)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--color-gray-700)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--color-gray-500)'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--color-gray-600)',
            }}
          >
            <ExternalLink size={16} /> View Live Store
          </Link>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: '#DC2626',
              fontWeight: '500',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header for Admin */}
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="admin-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🍄</span>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-gray-900)' }}>
              ClayMelo Admin
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600' }}>
              Store
            </Link>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              style={{ color: 'var(--color-gray-700)', padding: '4px' }}
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }} className="admin-mobile-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '500',
                    backgroundColor: isActive ? 'var(--color-pink-50)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--color-gray-700)',
                  }}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Children */}
        <main style={{ padding: '24px 20px 60px 20px', flexGrow: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .admin-mobile-header {
            display: none !important;
          }
          .admin-mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

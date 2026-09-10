'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartSubtotal, removeFromCart, updateCartQuantity, user, loadingUser } = useShop();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.replace('/login?redirect=/cart');
    }
  }, [loadingUser, user, router]);

  if (loadingUser || !user) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Redirecting to login...</p>
      </div>
    );
  }

  const freeShippingThreshold = 999;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '64px 16px', maxWidth: '600px' }}>
        <div className="empty-state">
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-pink-50)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            <ShoppingBag size={30} />
          </div>
          <h3>Your cart is empty. 🍄</h3>
          <p>Explore our cute polymer clay keychains, charms, and boutique desk companions.</p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 16px 64px 16px' }}>
      <h1 style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
        fontWeight: '700',
        color: 'var(--color-gray-900)',
        marginBottom: '24px',
      }}>
        Shopping Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
      </h1>

      {/* Free Shipping Progress Indicator */}
      <div style={{
        backgroundColor: 'var(--color-pink-50)',
        border: '1px solid var(--border-pink)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '600', color: 'var(--color-pink-800)', marginBottom: '8px' }}>
          <span>
            {remainingForFree > 0
              ? `Add ₹${remainingForFree} more for FREE shipping!`
              : '🎉 You have unlocked FREE shipping!'}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#ffffff',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: 'var(--primary)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Left: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                gap: '16px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {/* Product Thumbnail */}
              <Link href={`/product/${item.product_id}`} style={{
                width: '85px',
                height: '85px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: '#F9FAFB',
              }}>
                <img
                  src={item.image_url || '/placeholder-clay.svg'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>

              {/* Product Info & Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Link href={`/product/${item.product_id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
                      {item.name}
                    </h3>
                  </Link>

                  <button
                    onClick={() => item.cart_item_id && removeFromCart(item.cart_item_id)}
                    style={{ color: 'var(--color-gray-400)', padding: '4px' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                  ₹{item.price}
                </div>

                {/* Quantity Controls & Line Total */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => updateCartQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                      style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: '700' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 8px', fontSize: '0.88rem', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product_id, Math.min(item.stock, item.quantity + 1))}
                      style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: '700' }}
                    >
                      +
                    </button>
                  </div>

                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-700)' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: '600' }}>₹{cartSubtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-700)' }}>
              <span>Estimated Shipping</span>
              <span style={{ fontWeight: '500', color: cartSubtotal >= freeShippingThreshold ? '#059669' : 'var(--text-muted)' }}>
                {cartSubtotal >= freeShippingThreshold ? 'FREE' : 'Calculated at checkout'}
              </span>
            </div>
          </div>

          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
              Subtotal
            </span>
            <span style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
            }}>
              ₹{cartSubtotal}
            </span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: '8px' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '4px',
          }}>
            <ShieldCheck size={16} color="var(--primary)" />
            Safe Checkout via PhonePe & UPI
          </div>
        </div>
      </div>
    </div>
  );
}

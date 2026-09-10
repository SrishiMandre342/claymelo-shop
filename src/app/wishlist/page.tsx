'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, addToCart } = useShop();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistItems() {
      try {
        setLoading(true);
        // Fetch all products and filter matching wishlistIds
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products) {
          const wishlisted = data.products.filter((p: any) => wishlistIds.includes(p.id));
          setItems(wishlisted);
        }
      } catch (e) {
        console.error('Failed to load wishlist products', e);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistItems();
  }, [wishlistIds]);

  const handleRemove = async (productId: number) => {
    await toggleWishlist(productId);
  };

  const handleMoveToCart = async (productId: number) => {
    await addToCart(productId, 1);
    await toggleWishlist(productId);
  };

  return (
    <div className="container" style={{ padding: '32px 16px 64px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          My Wishlist <Heart size={26} color="var(--primary)" fill="var(--color-pink-100)" />
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Saved creations you love.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          Loading saved items...
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Your wishlist is waiting for something cute. 🍄</h3>
          <p>Tap the heart icon on any clay creation to save it here for later.</p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Explore Handcrafted Shop <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {items.map((item) => {
            const isSoldOut = !item.is_available || item.stock <= 0;
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <Link href={`/product/${item.id}`} style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
                  <img
                    src={item.primary_image || '/placeholder-clay.svg'}
                    alt={item.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSoldOut && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(31, 41, 55, 0.85)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      Sold Out
                    </span>
                  )}
                </Link>

                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '8px' }}>
                  <Link href={`/product/${item.id}`}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-gray-900)', lineHeight: '1.4' }}>
                      {item.name}
                    </h3>
                  </Link>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                    ₹{item.price}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '10px' }}>
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--color-gray-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => handleMoveToCart(item.id)}
                      disabled={isSoldOut}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      <ShoppingBag size={15} /> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

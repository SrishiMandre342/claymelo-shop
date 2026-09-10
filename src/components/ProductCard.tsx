'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  stock: number;
  is_available: number;
  primary_image?: string;
  category_name?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  original_price,
  stock,
  is_available,
  primary_image,
  category_name,
}: ProductCardProps) {
  const { isWishlisted, toggleWishlist, addToCart, user } = useShop();
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const isSoldOut = !is_available || stock <= 0;
  const wishlisted = isWishlisted(id);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    setAnimatingHeart(true);
    await toggleWishlist(id);
    setTimeout(() => setAnimatingHeart(false), 400);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    if (isSoldOut || adding) return;

    setAdding(true);
    const ok = await addToCart(id, 1);
    setAdding(false);
    if (ok) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1800);
    }
  };

  const discountPercent = original_price && original_price > price
    ? Math.round(((original_price - price) / original_price) * 100)
    : null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
      }}
      className="clay-product-card"
    >
      {/* Product Image Area */}
      <Link href={`/product/${id}`} style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', backgroundColor: '#F9FAFB' }}>
        <img
          src={primary_image || '/placeholder-clay.svg'}
          alt={name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="clay-card-img"
          loading="lazy"
        />

        {/* Stock or Discount Badge */}
        {isSoldOut ? (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(31, 41, 55, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'uppercase',
          }}>
            Sold Out
          </span>
        ) : discountPercent ? (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
          }}>
            {discountPercent}% OFF
          </span>
        ) : null}

        {/* Wishlist Floating Button */}
        <button
          onClick={handleHeartClick}
          aria-label="Wishlist"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: wishlisted ? 'var(--primary)' : 'var(--color-gray-600)',
            transition: 'transform var(--transition-fast)',
          }}
        >
          <Heart
            size={18}
            fill={wishlisted ? 'var(--primary)' : 'none'}
            className={animatingHeart ? 'animate-heart' : ''}
          />
        </button>
      </Link>

      {/* Product Content Details */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
        {category_name && (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: '600',
            color: 'var(--color-pink-700)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {category_name}
          </span>
        )}

        <Link href={`/product/${id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '0.94rem',
            fontWeight: '600',
            color: 'var(--color-gray-900)',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {name}
          </h3>
        </Link>

        {/* Pricing Block */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          <span style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.15rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            ₹{price}
          </span>
          {original_price && original_price > price && (
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--color-gray-400)',
              textDecoration: 'line-through',
            }}>
              ₹{original_price}
            </span>
          )}
        </div>

        {/* Low Stock Indicator */}
        {!isSoldOut && stock <= 3 && (
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: '600' }}>
            Only {stock} left in stock!
          </span>
        )}

        {/* Quick Add to Cart CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          {isSoldOut ? (
            <button
              disabled
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.84rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-gray-100)',
                color: 'var(--color-gray-400)',
                cursor: 'not-allowed',
              }}
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: addedSuccess ? '#10B981' : 'var(--color-pink-50)',
                color: addedSuccess ? '#ffffff' : 'var(--primary)',
                border: addedSuccess ? '1px solid #10B981' : '1px solid var(--border-pink)',
                transition: 'all var(--transition-fast)',
              }}
              className="add-cart-btn"
            >
              {addedSuccess ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={15} /> Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .clay-product-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-pink);
        }
        .clay-product-card:hover .clay-card-img {
          transform: scale(1.04);
        }
        .add-cart-btn:hover {
          background-color: var(--primary) !important;
          color: #ffffff !important;
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft, ShieldCheck, Truck, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isWishlisted, toggleWishlist, addToCart } = useShop();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          if (data.product.images && data.product.images.length > 0) {
            setSelectedImage(data.product.images[0].image_url);
          }
        }
      } catch (e) {
        console.error('Failed to load product', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading handcrafted details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 16px' }}>
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>The piece you are looking for may have retired or moved.</p>
          <Link href="/shop" className="btn btn-primary">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const isSoldOut = !product.is_available || product.stock <= 0;
  const wishlisted = isWishlisted(product.id);
  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAdd = async () => {
    if (isSoldOut || addingToCart) return;
    setAddingToCart(true);
    const ok = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (ok) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  const handleOrderNow = async () => {
    if (isSoldOut) return;
    const ok = await addToCart(product.id, quantity);
    if (ok) {
      router.push('/checkout');
    }
  };

  return (
    <div className="container" style={{ padding: '24px 16px 64px 16px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.84rem',
        color: 'var(--text-muted)',
        marginBottom: '20px',
      }}>
        <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop" style={{ color: 'var(--text-muted)' }}>Shop</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-gray-900)', fontWeight: '600' }}>
          {product.name}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'start',
      }}>
        {/* Left Column: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Selected Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <img
              src={selectedImage || product.images?.[0]?.image_url || '/placeholder-clay.svg'}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Sold Out Overlay */}
            {isSoldOut && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--color-gray-900)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails row if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImage === img.image_url ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {product.category_name && (
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {product.category_name}
            </span>
          )}

          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
            lineHeight: '1.25',
          }}>
            {product.name}
          </h1>

          {/* Price & Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.85rem',
              fontWeight: '700',
              color: 'var(--color-gray-900)',
            }}>
              ₹{product.price}
            </span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-gray-400)',
                  textDecoration: 'line-through',
                }}>
                  ₹{product.original_price}
                </span>
                <span style={{
                  backgroundColor: 'var(--color-pink-100)',
                  color: 'var(--color-pink-700)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {discountPercent}% OFF
                </span>
              </>
            )}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              (Inclusive of all taxes)
            </span>
          </div>

          {/* Stock Status */}
          <div>
            {isSoldOut ? (
              <span className="badge-pill badge-gray" style={{ fontSize: '0.85rem' }}>
                Currently Sold Out
              </span>
            ) : product.stock <= 3 ? (
              <span className="badge-pill" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.85rem' }}>
                Hurry, only {product.stock} left in stock!
              </span>
            ) : (
              <span className="badge-pill badge-green" style={{ fontSize: '0.85rem' }}>
                ✓ In Stock & Ready to Ship
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{
            padding: '16px 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '8px' }}>
              Handcrafted Description
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-700)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {product.description || 'Each creation is individually sculpted from polymer clay and varnished with care.'}
            </p>

            <div style={{ marginTop: '14px', fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>• Material: Premium polymer clay & water-resistant finish</span>
              <span>• Clean gently with a soft dry cloth</span>
              <span>• Avoid harsh chemicals or prolonged water immersion</span>
            </div>
          </div>

          {/* Quantity Selector & Wishlist */}
          {!isSoldOut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-gray-700)' }}>
                Quantity:
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px 14px', fontWeight: '700', color: 'var(--color-gray-700)' }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontSize: '0.95rem', fontWeight: '600' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ padding: '8px 14px', fontWeight: '700', color: 'var(--color-gray-700)' }}
                >
                  +
                </button>
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  color: wishlisted ? 'var(--primary)' : 'var(--color-gray-700)',
                  backgroundColor: wishlisted ? 'var(--color-pink-50)' : '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                }}
              >
                <Heart size={18} fill={wishlisted ? 'var(--primary)' : 'none'} />
                {wishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {isSoldOut ? (
              <button
                disabled
                className="btn btn-lg btn-full"
                style={{ backgroundColor: 'var(--color-gray-200)', color: 'var(--color-gray-500)' }}
              >
                Sold Out
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAdd}
                  disabled={addingToCart}
                  className="btn btn-secondary btn-lg"
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleOrderNow}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1.2, minWidth: '160px' }}
                >
                  Order Now →
                </button>
              </div>
            )}
          </div>

          {/* Assurance info badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '14px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            marginTop: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-gray-700)' }}>
              <Truck size={18} color="var(--primary)" />
              <span>Pan-India Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-gray-700)' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Safe PhonePe / UPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

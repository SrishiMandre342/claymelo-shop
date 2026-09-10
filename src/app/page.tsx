'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Package,
  ShieldCheck,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';

const MARQUEE_ITEMS = [
  { emoji: '🍄', text: '100% Hand-Sculpted' },
  { emoji: '✨', text: 'Triple Glazed for Shine' },
  { emoji: '🍓', text: 'Small Batch Artisanal Drops' },
  { emoji: '📦', text: 'Safe Bubble-Wrapped Packing' },
  { emoji: '💌', text: 'Instant UPI & PhonePe Payment' },
  { emoji: '🌸', text: 'Made with Love & Polymer Clay' },
  { emoji: '🗝️', text: 'Custom Keychains & Phone Charms' },
];

export default function HomePage() {
  const { user, isWishlisted, toggleWishlist } = useShop();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sliding Window state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [likedSlides, setLikedSlides] = useState<Record<string, boolean>>({});
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/random_artz2/');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products) {
          setAllProducts(data.products);
          const feat = data.products.filter((p: any) => p.is_featured);
          setFeaturedProducts(feat.length > 0 ? feat : data.products.slice(0, 8));
        }
        if (data.categories) {
          setCategories(data.categories);
        }

        const sRes = await fetch('/api/settings');
        const sData = await sRes.json();
        if (sData.settings?.instagram_url) {
          setInstagramUrl(sData.settings.instagram_url);
        }
      } catch (e) {
        console.error('Failed to load home page data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ONLY show images uploaded by the admin
  const activeSlides = React.useMemo(() => {
    return (allProducts || [])
      .filter((p) => p.primary_image && !p.primary_image.includes('placeholder'))
      .map((p) => ({
        id: p.id,
        name: p.name,
        tag: p.is_featured ? '🍄 Featured Creation' : (p.category_name ? `🌸 ${p.category_name}` : '✨ Handcrafted Clay'),
        price: p.price,
        original_price: p.original_price,
        image: p.primary_image,
        description: p.description || 'Artisan handcrafted polymer clay piece, uniquely sculpted.',
        link: `/product/${p.id}`,
      }));
  }, [allProducts]);

  // Auto slide interval
  useEffect(() => {
    if (!isAutoPlay || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlay, activeSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const toggleHeart = async (id: string | number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (typeof id === 'number') {
      await toggleWishlist(id);
    }
    setLikedSlides((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fallbackSlide = {
    id: 'placeholder',
    name: 'Handcrafted Clay Art',
    tag: '🍄 ClayMelo Boutique',
    price: 299,
    original_price: null,
    image: '/placeholder-clay.svg',
    description: 'Upload your first clay piece in the Admin Dashboard.',
    link: '/shop',
  };

  const currentItem = activeSlides[currentSlide] || activeSlides[0] || fallbackSlide;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '72px' }}>
      {/* 1. Hero Section with Dreamy Baby Pink Gradient & Floating Glows */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #FFF1F5 0%, #FDF2F8 30%, #FCE7F3 70%, #FFF5F7 100%)',
          borderBottom: '1px solid #FBCFE8',
          padding: '56px 0 52px 0',
        }}
      >
        {/* Soft Ambient Glowing Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-60px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, rgba(253, 242, 248, 0) 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-40px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251, 207, 232, 0.5) 0%, rgba(254, 242, 242, 0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '45%',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 205, 232, 0.35) 0%, rgba(255, 255, 255, 0) 65%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Left Text Block */}
          <div style={{ maxWidth: '540px' }}>
            {/* Cute Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--color-pink-700)',
                fontSize: '0.84rem',
                fontWeight: '700',
                marginBottom: '18px',
                border: '1px solid #FBCFE8',
                boxShadow: '0 2px 10px rgba(219, 39, 119, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={15} color="#DB2777" />
              <span>Artisan Polymer Clay Boutique</span>
              <span style={{ fontSize: '0.8rem' }}>✨</span>
            </div>

            {/* Brand Title with Gradient Text */}
            <h1
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(2.3rem, 5.5vw, 3.4rem)',
                fontWeight: '800',
                lineHeight: '1.14',
                letterSpacing: '-0.025em',
                marginBottom: '16px',
                color: '#1F2937',
              }}
            >
              ClayMelo{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #BE185D 0%, #DB2777 50%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Handcrafted
              </span>{' '}
              <span style={{ fontSize: '0.9em', display: 'inline-block', transform: 'rotate(-6deg)' }}>🍄</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 2.4vw, 1.15rem)',
                color: '#4B5563',
                lineHeight: '1.65',
                marginBottom: '28px',
              }}
            >
              Whimsical polymer clay keychains, jewelry trinket dishes, and desk buddies sculpted with love.
              Each cute companion is pinched, baked, painted, and triple-glazed one by one.
            </p>

            {/* Call to Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link
                href={user ? "/shop" : "/login?redirect=/shop"}
                className="btn btn-primary btn-lg"
                style={{
                  backgroundColor: 'var(--primary)',
                  boxShadow: '0 8px 20px -3px rgba(219, 39, 119, 0.38)',
                  padding: '12px 26px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  gap: '10px',
                }}
              >
                <ShoppingBag size={18} /> Shop Clay Drops <ArrowRight size={17} />
              </Link>
            </div>

            {/* Social Proof Mini Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px dashed #FBCFE8',
              }}
            >
              <div style={{ display: 'flex', color: '#F59E0B' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: '0.84rem', fontWeight: '600', color: '#6B7280' }}>
                <strong style={{ color: '#1F2937' }}>500+ happy buyers</strong> • Instagram community loved 💖
              </span>
            </div>
          </div>

          {/* Right Visual Focus: "Sliding Window" of Clay Arts */}
          <div
            style={{
              position: 'relative',
              maxWidth: '460px',
              width: '100%',
              margin: '0 auto',
            }}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          >
            {/* Ambient Backing Glow */}
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '34px',
                background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.4) 0%, rgba(251, 207, 232, 0.4) 100%)',
                filter: 'blur(16px)',
                zIndex: 0,
              }}
            />

            {/* The Main Sliding Window Frame */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                borderRadius: '28px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #FCE7F3',
                boxShadow: '0 20px 40px -15px rgba(219, 39, 119, 0.22), 0 0 0 1px rgba(251, 207, 232, 0.8)',
                aspectRatio: '1 / 1',
                maxHeight: '450px',
              }}
              className="clay-sliding-window"
            >
              {/* Product Image with smooth fade */}
              <img
                key={currentItem.id}
                src={currentItem.image}
                alt={currentItem.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  animation: 'fadeInSlide 400ms ease-out',
                }}
              />

              {/* Top Floating Badge Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(10px)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #FCE7F3',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#BE185D',
                }}
              >
                {currentItem.tag}
              </div>

              {/* Top Right Heart Wishlist Button */}
              <button
                type="button"
                onClick={(e) => toggleHeart(currentItem.id, e)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 2,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #FCE7F3',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                className="heart-btn"
                aria-label="Add to wishlist"
              >
                <Heart
                  size={18}
                  color={(typeof currentItem.id === 'number' && isWishlisted(currentItem.id)) || likedSlides[currentItem.id] ? '#DB2777' : '#9CA3AF'}
                  fill={(typeof currentItem.id === 'number' && isWishlisted(currentItem.id)) || likedSlides[currentItem.id] ? '#DB2777' : 'none'}
                />
              </button>

              {/* Prev / Next Sliding Navigation Buttons */}
              {activeSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '48%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #FCE7F3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      color: '#BE185D',
                      cursor: 'pointer',
                    }}
                    className="slider-nav-btn"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextSlide}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '48%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #FCE7F3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      color: '#BE185D',
                      cursor: 'pointer',
                    }}
                    className="slider-nav-btn"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Bottom Frosted Glass Highlight Card */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(12px)',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px -6px rgba(219, 39, 119, 0.18)',
                  border: '1px solid rgba(251, 207, 232, 0.9)',
                  zIndex: 2,
                }}
              >
                <div style={{ maxWidth: '68%', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '1.05rem',
                        fontWeight: '800',
                        color: 'var(--primary)',
                      }}
                    >
                      ₹{currentItem.price}
                    </span>
                    {currentItem.original_price && (
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                        ₹{currentItem.original_price}
                      </span>
                    )}
                  </div>
                  <h4
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      color: '#1F2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '2px',
                    }}
                  >
                    {currentItem.name}
                  </h4>
                </div>

                <Link
                  href={currentItem.link}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(219, 39, 119, 0.3)',
                    flexShrink: 0,
                  }}
                  className="adopt-btn"
                >
                  Buy Now <ArrowRight size={14} />
                </Link>
              </div>

              {/* Slide Indicator Dots */}
              {activeSlides.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {activeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        width: currentSlide === idx ? '20px' : '6px',
                        height: '6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: currentSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Seamless Moving Baby-Pink Ribbon Marquee */}
      <section
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          background: 'linear-gradient(90deg, #FDF2F8 0%, #FFF0F5 50%, #FDF2F8 100%)',
          borderTop: '1px solid #FCE7F3',
          borderBottom: '1px solid #FCE7F3',
          padding: '12px 0',
          marginTop: '-48px',
          boxShadow: 'inset 0 1px 3px rgba(219, 39, 119, 0.04)',
        }}
      >
        <div className="clay-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginRight: '36px',
                fontSize: '0.88rem',
                fontWeight: '700',
                color: '#9D174D',
              }}
            >
              <span>{item.emoji}</span>
              <span>{item.text}</span>
              <span style={{ fontSize: '0.7rem', color: '#F472B6', marginLeft: '12px' }}>🌸</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trust Highlights Cards */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            padding: '22px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #FCE7F3',
            boxShadow: '0 4px 20px rgba(244, 114, 182, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#FDF2F8',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #FCE7F3',
              }}
            >
              <Heart size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1F2937' }}>100% Handcrafted</h4>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Every piece uniquely sculpted</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#FDF2F8',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #FCE7F3',
              }}
            >
              <Package size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1F2937' }}>Safe Bubble Pack</h4>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Packed to arrive safe & intact</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#FDF2F8',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #FCE7F3',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1F2937' }}>UPI & PhonePe</h4>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Direct instant phone payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Products Section */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} /> Artisan Drops
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.85rem',
                fontWeight: '800',
                color: '#111827',
                marginTop: '2px',
              }}
            >
              Featured Creations 🍄
            </h2>
          </div>
          <Link
            href={user ? "/shop" : "/login?redirect=/shop"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--primary)',
              backgroundColor: '#FDF2F8',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #FCE7F3',
            }}
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {/* 2-column on mobile, 4-column on desktop */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '20px',
          }}
          className="products-grid"
        >
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                original_price={product.original_price}
                stock={product.stock}
                is_available={product.is_available}
                primary_image={product.primary_image}
                category_name={product.category_name}
              />
            ))
          ) : (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '30px 0',
              }}
            >
              No products found. Add your handmade clay art in the Admin Dashboard!
            </p>
          )}
        </div>
      </section>

      {/* 5. Category Discovery Cards */}
      <section className="container">
        <div style={{ marginBottom: '22px' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Explore the Collection
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.85rem',
              fontWeight: '800',
              color: '#111827',
              marginTop: '2px',
            }}
          >
            Browse By Category ✨
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #FCE7F3',
                borderRadius: '20px',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 4px 16px rgba(244, 114, 182, 0.06)',
                transition: 'all 0.25s ease',
              }}
              className="cat-card"
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: '#FDF2F8',
                  border: '1px solid #FCE7F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                }}
              >
                {cat.slug.includes('keychain') ? '🗝️' : cat.slug.includes('dish') ? '🍓' : cat.slug.includes('desk') ? '🐸' : '✨'}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1F2937' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.84rem', color: '#6B7280', lineHeight: '1.5' }}>
                {cat.description || 'Explore our whimsical handmade collection'}
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Browse items <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Artisan Story Section */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF1F5 0%, #FDF2F8 50%, #FCE7F3 100%)',
            border: '2px solid #FBCFE8',
            borderRadius: '28px',
            padding: '42px 28px',
            textAlign: 'center',
            maxWidth: '820px',
            margin: '0 auto',
            boxShadow: '0 12px 32px -8px rgba(219, 39, 119, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '10px' }}>🍄</span>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.75rem',
              fontWeight: '800',
              color: '#1F2937',
              marginBottom: '12px',
            }}
          >
            Handmade with Love, One by One
          </h2>
          <p
            style={{
              fontSize: '0.96rem',
              color: '#4B5563',
              lineHeight: '1.75',
              maxWidth: '640px',
              margin: '0 auto 24px auto',
            }}
          >
            ClayMelo was born from a joy of turning soft polymer clay into everyday objects of charm and comfort.
            No mass factory molds — every piece is individually shaped, detailed with care, cured in small batches,
            and sealed with high-gloss protective glaze to accompany your daily adventures.
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              padding: '12px 26px',
              borderRadius: 'var(--radius-full)',
              fontWeight: '700',
              backgroundColor: 'var(--primary)',
              boxShadow: '0 6px 18px rgba(219, 39, 119, 0.35)',
            }}
          >
            <Instagram size={18} /> Join our Instagram Community 💖
          </a>
        </div>
      </section>

      {/* Keyframe Animations & Responsive Styles */}
      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0.4;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .clay-marquee-track {
          display: inline-flex;
          animation: marquee 24s linear infinite;
        }

        .clay-marquee-track:hover {
          animation-play-state: paused;
        }

        .slider-nav-btn {
          opacity: 0.85;
          transition: all 0.2s ease;
        }

        .slider-nav-btn:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.1) !important;
          background-color: #ffffff !important;
          color: var(--primary) !important;
          box-shadow: 0 6px 16px rgba(219, 39, 119, 0.25) !important;
        }

        .heart-btn:hover {
          transform: scale(1.12);
        }

        .adopt-btn {
          transition: all 0.2s ease;
        }

        .adopt-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(219, 39, 119, 0.45) !important;
        }

        @media (min-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
            gap: 22px !important;
          }
        }

        .cat-card:hover {
          border-color: var(--primary) !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -4px rgba(219, 39, 119, 0.18) !important;
        }
      `}</style>
    </div>
  );
}

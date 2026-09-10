'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loadingUser } = useShop();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loadingUser && !user) {
      const q = searchParams.toString();
      const redirectTarget = `/shop${q ? `?${q}` : ''}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [loadingUser, user, router, searchParams]);

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentAvailability = searchParams.get('availability') || 'all';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function fetchShopProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
        if (currentSearch) params.set('search', currentSearch);
        if (currentSort) params.set('sort', currentSort);
        if (currentAvailability === 'available') params.set('availability', 'available');

        if (!user) return;
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
      } catch (e) {
        console.error('Failed to load shop items', e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchShopProducts();
    }
  }, [currentCategory, currentSearch, currentSort, currentAvailability, user]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  if (loadingUser || !user) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 16px 64px 16px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.3rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          marginBottom: '6px',
        }}>
          Handmade Shop 🍄
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Explore our collection of hand-sculpted clay charms, dishes, and boutique accessories.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {/* Top: Search & Sort Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Search Field */}
          <form onSubmit={handleSearchSubmit} style={{
            position: 'relative',
            flexGrow: 1,
            maxWidth: '400px',
            minWidth: '220px',
          }}>
            <input
              type="text"
              placeholder="Search clay creations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '38px',
                paddingRight: searchInput ? '34px' : '14px',
                fontSize: '0.9rem',
              }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-gray-400)',
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilter('search', '');
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gray-400)',
                }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              Sort:
            </span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="form-select"
              style={{ padding: '8px 12px', fontSize: '0.85rem', width: 'auto', minWidth: '150px' }}
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Availability Toggle */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color)',
        }}>
          <button
            onClick={() => updateFilter('category', 'all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: '600',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              transition: 'all var(--transition-fast)',
            }}
          >
            All Items
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-gray-700)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={currentAvailability === 'available'}
                onChange={(e) => updateFilter('availability', e.target.checked ? 'available' : 'all')}
                style={{ accentColor: 'var(--primary)' }}
              />
              In Stock Only
            </label>
          </div>
        </div>
      </div>

      {/* Product Results Count */}
      <div style={{ marginBottom: '16px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
        Showing {products.length} {products.length === 1 ? 'handmade piece' : 'handmade pieces'}
      </div>

      {/* Products Grid: 2 columns on mobile, 3-4 columns on desktop */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }} className="shop-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '12px',
                height: '320px',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>New creations are coming soon. 🍄</h3>
          <p>We couldn't find any clay items matching your search criteria.</p>
          <button
            onClick={() => router.push('/shop')}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }} className="shop-grid">
          {products.map((product) => (
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
          ))}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 640px) {
          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)) !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '32px 16px' }}>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

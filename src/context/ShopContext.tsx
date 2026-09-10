'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
}

export interface CartItem {
  cart_item_id?: number;
  product_id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  stock: number;
  is_available: number;
  quantity: number;
  image_url: string;
}

interface ShopContextType {
  user: UserInfo | null;
  loadingUser: boolean;
  cartCount: number;
  wishlistCount: number;
  wishlistIds: number[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<boolean>;
  cartItems: CartItem[];
  cartSubtotal: number;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateCartQuantity: (productId: number, quantity: number) => Promise<void>;
  logout: () => Promise<void>;
  sessionId: string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize guest session ID if needed
  useEffect(() => {
    let sid = localStorage.getItem('cm_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('cm_session_id', sid);
    }
    setSessionId(sid);

    // Load guest wishlist if present
    const savedWish = localStorage.getItem('cm_guest_wishlist');
    if (savedWish) {
      try {
        setWishlistIds(JSON.parse(savedWish));
      } catch {}
    }
  }, []);

  // Fetch current user
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch cart
  const refreshCart = async () => {
    try {
      const sid = sessionId || localStorage.getItem('cm_session_id') || '';
      const res = await fetch(`/api/cart?sessionId=${encodeURIComponent(sid)}`);
      const data = await res.json();
      if (data.items) {
        setCartItems(data.items);
        setCartSubtotal(data.subtotal || 0);
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  };

  // Fetch wishlist
  const refreshWishlist = async () => {
    if (user) {
      try {
        const res = await fetch('/api/wishlist');
        const data = await res.json();
        if (data.items) {
          const ids = data.items.map((it: any) => it.product_id);
          setWishlistIds(ids);
        }
      } catch (e) {
        console.error('Failed to load wishlist', e);
      }
    }
  };

  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId, user]);

  useEffect(() => {
    if (user) {
      refreshWishlist();
    }
  }, [user]);

  const addToCart = async (productId: number, quantity: number = 1): Promise<boolean> => {
    try {
      const sid = sessionId || localStorage.getItem('cm_session_id') || '';
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, sessionId: sid }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCart();
        return true;
      } else {
        alert(data.error || 'Failed to add item to cart');
        return false;
      }
    } catch (e) {
      alert('Could not update cart. Please try again.');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const sid = sessionId || localStorage.getItem('cm_session_id') || '';
      await fetch(`/api/cart?cartItemId=${cartItemId}&sessionId=${encodeURIComponent(sid)}`, {
        method: 'DELETE',
      });
      await refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const updateCartQuantity = async (productId: number, quantity: number) => {
    await addToCart(productId, quantity);
  };

  const isWishlisted = (productId: number) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (user) {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (data.saved) {
          setWishlistIds(prev => [...prev, productId]);
          return true;
        } else {
          setWishlistIds(prev => prev.filter(id => id !== productId));
          return false;
        }
      } catch {
        return false;
      }
    } else {
      // Guest local wishlist
      let next = [...wishlistIds];
      let saved = false;
      if (next.includes(productId)) {
        next = next.filter(id => id !== productId);
        saved = false;
      } else {
        next.push(productId);
        saved = true;
      }
      setWishlistIds(next);
      localStorage.setItem('cm_guest_wishlist', JSON.stringify(next));
      return saved;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (e) {
      console.error(e);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  return (
    <ShopContext.Provider
      value={{
        user,
        loadingUser,
        cartCount,
        wishlistCount,
        wishlistIds,
        isWishlisted,
        toggleWishlist,
        cartItems,
        cartSubtotal,
        refreshCart,
        refreshWishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        logout,
        sessionId,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

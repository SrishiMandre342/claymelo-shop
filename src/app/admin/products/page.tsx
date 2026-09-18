'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  X,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  Eye,
  Star
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search/Filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.categories) {
        setCategories(data.categories);
        if (!categoryId && data.categories.length > 0) {
          setCategoryId(String(data.categories[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load admin products', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setStock('5');
    setIsFeatured(false);
    setIsAvailable(true);
    setImages([]);
    setErrorMsg('');
    if (categories.length > 0) setCategoryId(String(categories[0].id));
    setModalOpen(true);
  };

  const openEditModal = async (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(String(prod.price));
    setOriginalPrice(prod.original_price ? String(prod.original_price) : '');
    setStock(String(prod.stock));
    setCategoryId(prod.category_id ? String(prod.category_id) : '');
    setIsFeatured(!!prod.is_featured);
    setIsAvailable(!!prod.is_available);
    setErrorMsg('');
    setModalOpen(true);

    try {
      const res = await fetch(`/api/products/${prod.id}`);
      const data = await res.json();
      if (data.product?.images) {
        const realImages = data.product.images
          .map((img: any) => img.image_url)
          .filter((url: string) => url && !url.includes('placeholder'));
        setImages(realImages);
      } else {
        setImages([]);
      }
    } catch {
      setImages(prod.primary_image && !prod.primary_image.includes('placeholder') ? [prod.primary_image] : []);
    }
  };

  // Helper: Client-side auto compression for high-res mobile camera photos (HEIC/JPEG/PNG)
  const compressAndFormatImage = async (file: File): Promise<File> => {
    // If not an image, return original
    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          const maxDimension = 1600;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const cleanBase = (file.name || 'mobile_photo')
                .replace(/\.[^/.]+$/, '')
                .replace(/[^\w-]/g, '_');
              const compressedFile = new File([blob], `${cleanBase}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85
          );
        } catch (err) {
          console.warn('Canvas resize failed, falling back to original:', err);
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  // Helper: convert File to base64 Data URL for network fallback
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Upload image handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setUploadingImage(true);
    setErrorMsg('');

    try {
      // 1. Process and auto-compress all selected photos (resizes huge 10MB+ phone shots to ~150KB-250KB)
      const processedFiles: File[] = [];
      for (let i = 0; i < rawFiles.length; i++) {
        const compressed = await compressAndFormatImage(rawFiles[i]);
        processedFiles.push(compressed);
      }

      // 2. Upload via multipart FormData
      const formData = new FormData();
      for (const file of processedFiles) {
        formData.append('files', file);
      }

      let res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      // 3. Fallback to base64 JSON payload if multipart failed (for restrictive mobile networks)
      if (!res.ok || !data?.urls || data.urls.length === 0) {
        const base64List: string[] = [];
        for (const file of processedFiles) {
          const b64 = await fileToBase64(file);
          base64List.push(b64);
        }

        res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: base64List }),
        });

        data = await res.json();
      }

      if (res.ok && data?.urls && data.urls.length > 0) {
        setImages(prev => [...prev, ...data.urls]);
      } else {
        setErrorMsg(data?.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg('Image upload failed. Please try again with another photo.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    setImages(prev => prev.filter(u => u !== url));
  };

  // Submit product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !price) {
      setErrorMsg('Product name and price are required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id: editingProduct?.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock || '0', 10),
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        isFeatured,
        isAvailable,
        images: images.length > 0 ? images : ['/placeholder-clay.svg'],
      };

      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save product');
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      setErrorMsg('Failed to save product. Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number, prodName: string) => {
    if (!confirm(`Are you sure you want to delete "${prodName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadProducts();
      } else {
        alert('Could not delete product.');
      }
    } catch (err) {
      alert('Network error while deleting product.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-gray-900)',
          }}>
            Products & Handmade Art 🍄
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Upload your clay art photos, configure prices, and manage inventory stock.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
          <PlusCircle size={18} /> Add New Clay Art
        </button>
      </div>

      {/* Filter and Search Input */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Search size={18} color="var(--color-gray-400)" />
        <input
          type="text"
          placeholder="Search products by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.9rem',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Products Table Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <span style={{ fontSize: '2rem' }}>🍄</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '8px' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '8px 0 16px 0' }}>
              Click "Add New Clay Art" to upload your first creation.
            </p>
            <button onClick={openAddModal} className="btn btn-primary">
              Add New Product
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--color-gray-50)',
                  borderBottom: '1px solid var(--border-color)',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <th style={{ padding: '12px 16px' }}>Product</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* Image & Title */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.primary_image || '/placeholder-clay.svg'}
                          alt=""
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            backgroundColor: '#F9FAFB',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--color-gray-900)' }}>
                            {prod.name}
                          </div>
                          {prod.is_featured === 1 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Star size={12} fill="var(--primary)" /> Featured Drop
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--color-gray-700)' }}>
                      {prod.category_name || 'Uncategorized'}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                      ₹{prod.price}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontWeight: '600',
                        color: prod.stock <= 2 ? '#D97706' : 'var(--color-gray-900)'
                      }}>
                        {prod.stock} units
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {prod.is_available && prod.stock > 0 ? (
                        <span className="badge-pill badge-green">Available</span>
                      ) : (
                        <span className="badge-pill badge-gray">Sold Out</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(prod)}
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-gray-100)',
                            color: 'var(--color-gray-700)',
                          }}
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                          }}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '580px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                {editingProduct ? 'Edit Clay Creation' : 'Add New Clay Art Piece'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--color-gray-400)' }}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#B91C1C',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Name */}
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Handmade Strawberry Glazed Dish"
                  className="form-input"
                />
              </div>

              {/* Photo Upload Area */}
              <div className="form-group">
                <label className="form-label">Product Photographs *</label>
                <div style={{
                  border: '2px dashed var(--border-pink)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  backgroundColor: 'var(--color-pink-50)',
                  textAlign: 'center',
                  cursor: 'pointer',
                }} onClick={() => !uploadingImage && fileInputRef.current?.click()}>
                  <Upload size={26} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--color-gray-900)' }}>
                    {uploadingImage ? 'Optimizing & Uploading Photo...' : 'Click to upload art photos from your device'}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Auto-optimized for phones and laptops (JPG, PNG, HEIC, WEBP)
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </div>

                {uploadingImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '10px', color: 'var(--primary)', fontSize: '0.84rem', fontWeight: '600' }}>
                    <Sparkles size={16} />
                    <span>Compressing & saving mobile photo to store...</span>
                  </div>
                )}

                {/* Uploaded Images Preview Thumbnails */}
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {images.map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeImage(imgUrl)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Original Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 299"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 349"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Available count"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Handcrafted Story & Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your handcrafted polymer clay piece, dimensions, glaze, and care..."
                  className="form-textarea"
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Available for Purchase
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Featured on Homepage
                </label>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="btn btn-primary btn-lg btn-full"
                style={{ marginTop: '8px' }}
              >
                {uploadingImage ? (
                  'Please wait, photo is uploading...'
                ) : submitting ? (
                  'Saving Art Piece...'
                ) : (
                  <>
                    <Check size={18} /> {editingProduct ? 'Update Product' : 'Publish to Store'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

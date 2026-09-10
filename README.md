# ClayMelo 🍄 Full-Stack E-Commerce Website

A production-ready full-stack e-commerce application designed for **ClayMelo 🍄**, an artisanal brand selling handmade polymer clay art, whimsical keychains, trinket dishes, and desk companions. Tailored specifically for customers arriving via **Instagram bio links**, with mobile-first responsiveness, high usability inspired by **Myntra & Meesho**, and a boutique aesthetic (baby pink, clean white, and crisp typography).

---

## 🌟 Key Features

### Customer Experience (Mobile-First)
- **Home**: Clean hero section, featured clay drops, category exploration, artisan story, and Instagram community link.
- **Shop**: Real-time search, filters (categories, in-stock only), sorting (Price Low/High, Newest, Featured), responsive 2-column mobile layout.
- **Product Details**: Multi-image viewing, real-time stock availability, "Sold Out" state management, "Add to Cart", and direct "Order Now".
- **Wishlist**: Quick-tap heart toggle with instant animation, persisted for accounts.
- **Cart**: Dynamic quantity adjustments, server-side price validation, and free shipping progress indicator.
- **Checkout**: Address collection with **server-side dynamic shipping calculation** based on State, City, or Pincode.
- **Payment (PhonePe / UPI)**:
  - Mobile direct intent deep-link (`phonepe://pay?...`) opens the PhonePe app automatically on smartphones.
  - Universal UPI fallback for GPay, Paytm, and other apps (`upi://pay?...`).
  - Dynamic QR code generation for desktop shoppers.
  - 12-digit UTR/transaction reference submission with duplicate validation.
  - Developer/Sandbox mode for instant local testing.
- **Orders & Tracking**: Order confirmation page, order history (`/orders`), and step-by-step progress timeline (`/orders/[id]`).

### Admin Dashboard (`/admin`)
- **Dashboard Overview**: Total sales revenue, total orders, paid orders, pending payments, and catalog stats.
- **Product Management**:
  - Add and edit products with title, price, original price, stock, and category.
  - **Upload photos directly from your phone or computer** using the built-in image upload tool.
  - Toggle "Featured on Homepage" and "Available for Purchase".
- **Order Management**:
  - View full customer contact details and delivery addresses.
  - Inspect line items, purchase prices, and customer-submitted UTR numbers.
  - Transition order pipeline: `Processing` → `Shipped` → `Delivered` (or `Cancelled`).
  - 1-click payment verification.
- **Shipping Rules**:
  - Configure rates by State (e.g. Karnataka ₹49, Rest of India ₹79), City, or exact Pincode.
  - Set global free shipping threshold (e.g. Free on orders above ₹999).
- **Store & UPI Settings**:
  - Update your sister's UPI ID and payee display name.
  - Switch payment modes (`sandbox` / `direct_upi` / `phonepe_gateway`).
  - Update Instagram shop URL, support email, and phone number.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Custom Vanilla CSS with CSS Variables (Soft Baby Pink `#FCE7F3`, Deep Rose `#DB2777`, Charcoal text `#1F2937`)
- **Database**: Embedded SQLite via native Node.js `DatabaseSync` (`data/claymelo.db`)
- **State Management**: React Context (`ShopContext`) with local storage synchronization
- **Icons**: Lucide Icons
- **QR Engine**: `qrcode` canvas renderer
- **Authentication**: Salted Scrypt password hashing (`crypto.scryptSync`) + Signed JWT HTTP-only cookies

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js v20+ or v24+
- npm v10+

### 2. Installation
```bash
# Clone or navigate into project directory
cd Claymelo🍄

# Install dependencies
npm install
```

### 3. Initialize Database & Seed Catalog
```bash
node scripts/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (or use mobile responsive mode).

---

## 🔐 Credentials & Configuration

### Admin Access
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin) (or click "Store Admin" in footer)
- **Default Email**: `admin@claymelo.com`
- **Default Password**: `ClaymeloAdmin2026!`

### Environment Variables (`.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Base application URL | `http://localhost:3000` |
| `JWT_SECRET` | Secret key for customer and admin session tokens | `claymelo_super_secret_jwt_key_2026_boutique` |
| `PAYMENT_MODE` | Active payment mode: `sandbox`, `direct_upi`, or `phonepe_gateway` | `sandbox` |
| `UPI_ID` | Sister's UPI ID for direct customer transfers | `sisterclaymelo@upi` |
| `UPI_NAME` | Display name on payment apps | `ClayMelo Boutique` |
| `ADMIN_EMAIL` | Initial admin account email | `admin@claymelo.com` |
| `ADMIN_PASSWORD` | Initial admin password | `ClaymeloAdmin2026!` |

---

## 📱 PhonePe & UPI Payment Flow Details

1. **Direct UPI Mode (Sister's UPI ID)**:
   - When configured, customers on mobile tap **"Pay with PhonePe"**, which fires `phonepe://pay?pa={UPI_ID}&pn=...&am={TOTAL}&tn=ClayMelo-Order-{ID}&cu=INR`.
   - On desktop, an on-screen QR Code is generated with the exact order amount and reference note.
   - After paying, the customer enters the 12-digit UTR from PhonePe.
   - In `/admin/orders`, the store owner reviews the UTR and clicks **"Verify Payment (Mark Paid)"**.
2. **Sandbox / Dev Mode**:
   - For testing locally without real bank transfers, `PAYMENT_MODE=sandbox` allows 1-click simulated payment.

---

## 🌐 Production Deployment Guide

1. **Host on Vercel / Railway / Render**:
   - Push code to a Git repository.
   - Set environment variables in the hosting dashboard.
   - Run `npm run build`.
2. **Uploading Real Clay Art Photos**:
   - Go to `/admin/products` → Click **"Add New Clay Art"** → Click the photo upload zone → Select your product photos from your device → Enter price and stock → Publish!

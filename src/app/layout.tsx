import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ShopProvider } from '@/context/ShopContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ClayMelo 🍄 | Handmade Clay Art & Keychains',
  description: 'Handmade polymer clay creations, cute aesthetic keychains, trinket dishes & desk buddies made with love. Fast shipping pan-India.',
  keywords: ['handmade clay art', 'clay keychains', 'clay trinket dish', 'aesthetic desk buddies', 'polymer clay boutique', 'claymelo'],
  openGraph: {
    title: 'ClayMelo 🍄 | Handcrafted Clay Boutique',
    description: 'Explore adorable handcrafted polymer clay keychains, charms, and boutique desk art.',
    url: 'https://claymelo.shop',
    siteName: 'ClayMelo',
    images: [
      {
        url: '/placeholder-clay.svg',
        width: 800,
        height: 800,
        alt: 'ClayMelo Handmade Art',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍄</text></svg>" />
      </head>
      <body>
        <ShopProvider>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}

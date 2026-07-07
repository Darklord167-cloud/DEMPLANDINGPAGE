import type {Metadata} from 'next';
import Script from 'next/script';
import { Orbitron, Rajdhani, Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Dark Empire HQ',
  description: 'Official Headquarters of Dark Empire Lords LLC. $DEMP Token Verification, Products, and Services.',
  openGraph: {
    title: 'Dark Empire HQ',
    description: 'Official Headquarters of Dark Empire Lords LLC. $DEMP Token Verification, Products, and Services.',
    type: 'website',
    images: ['/assets/demp-banner.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dark Empire HQ',
    description: 'Official Headquarters of Dark Empire Lords LLC. $DEMP Token Verification, Products, and Services.',
    images: ['/assets/demp-banner.svg'],
  },
  icons: {
    icon: '/assets/demp-logo.svg',
    shortcut: '/assets/demp-logo.svg',
    apple: '/assets/demp-logo.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark", orbitron.variable, rajdhani.variable, spaceGrotesk.variable, "font-sans", inter.variable)}>
      <body className="bg-background text-foreground font-sans antialiased" suppressHydrationWarning>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-TTC6N8WC7P"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TTC6N8WC7P');
            `,
          }}
        />
        <Providers>
          <div className="min-h-screen flex flex-col relative w-full">
            <Navbar />
            <main className="flex-1 w-full pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

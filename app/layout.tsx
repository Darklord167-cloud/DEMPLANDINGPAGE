import type {Metadata} from 'next';
import Script from 'next/script';
import { Orbitron, Rajdhani, Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  metadataBase: new URL('https://darkempirelords.com'),
  title: {
    template: '%s | Dark Empire Command',
    default: 'Dark Empire Command Center',
  },
  description: "The Central Command for Dark Empire's Digital Sovereignty. Live $DEMP token tracking, whale alerts, and Web3 portfolio analytics.",
  manifest: '/manifest.json',
  openGraph: {
    title: 'Dark Empire Command Center',
    description: "The Central Command for Dark Empire's Digital Sovereignty. Live $DEMP token tracking, whale alerts, and Web3 portfolio analytics.",
    siteName: 'Dark Empire Command Center',
    type: 'website',
    images: ['/assets/demp-banner.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dark Empire Command Center',
    description: "The Central Command for Dark Empire's Digital Sovereignty. Live $DEMP token tracking, whale alerts, and Web3 portfolio analytics.",
    images: ['/assets/demp-banner.svg'],
  },
  icons: {
    icon: '/assets/demp-logo.svg',
    shortcut: '/assets/demp-logo.svg',
    apple: '/assets/demp-logo.svg',
  },
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark", orbitron.variable, rajdhani.variable, spaceGrotesk.variable, "font-sans", inter.variable)}>
      <body className="bg-[#09090b] text-foreground font-sans antialiased selection:bg-purple-900/40" suppressHydrationWarning>
        {gaMeasurementId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}');
                `,
              }}
            />
          </>
        )}
        <Providers>
          <div className="min-h-screen flex flex-col relative w-full bg-[#09090b] overflow-hidden">
            {/* Global Ambient Gold & Purple Blur Highlights */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[140px] opacity-70" />
              <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] opacity-60" />
              <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] opacity-60" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen w-full">
              <Navbar />
              <main className="flex-1 w-full pt-20">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}

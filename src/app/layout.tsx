import type { Metadata } from "next";
import { Poppins, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vedicstarastro.com"),
  title: {
    default: "VedicStarAstro - Authentic Vedic Astrology & Kundli Analysis",
    template: "%s | VedicStarAstro",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "128x128", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  description:
    "Get accurate Vedic astrology readings, free Kundli analysis, Nakshatra insights, and personalized horoscope predictions. Expert astrologers with 20+ years experience.",
  keywords: [
    "vedic astrology",
    "kundli",
    "birth chart",
    "horoscope",
    "nakshatra",
    "jyotish",
    "astrology consultation",
    "free kundli",
    "marriage compatibility",
    "career astrology",
  ],
  authors: [{ name: "VedicStarAstro" }],
  creator: "VedicStarAstro",
  publisher: "VedicStarAstro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vedicstarastro.com",
    siteName: "VedicStarAstro",
    title: "VedicStarAstro - Authentic Vedic Astrology & Kundli Analysis",
    description:
      "Get accurate Vedic astrology readings, free Kundli analysis, Nakshatra insights, and personalized horoscope predictions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VedicStarAstro - Vedic Astrology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VedicStarAstro - Authentic Vedic Astrology & Kundli Analysis",
    description:
      "Get accurate Vedic astrology readings, free Kundli analysis, and personalized horoscope predictions.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "VedicStarAstro",
              url: "https://vedicstarastro.com",
              logo: "https://vedicstarastro.com/logo.png",
              description:
                "Authentic Vedic Astrology services including Kundli analysis, Nakshatra readings, and personalized consultations.",
              foundingDate: "2024",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bangalore",
                addressRegion: "Karnataka",
                addressCountry: "IN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-XXXXXXXXXX",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi", "Kannada"],
              },
              sameAs: [
                "https://www.facebook.com/vedicstarastro",
                "https://www.instagram.com/vedicstarastro",
                "https://www.youtube.com/@vedicstarastro",
                "https://twitter.com/vedicstarastro",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${notoSans.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

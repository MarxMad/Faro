import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import { ClientProviders } from "@/components/providers/client-providers"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://faro.so"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Faro | Liquidez y guía para tu negocio",
    template: "%s | Faro",
  },
  description:
    "Faro alumbra y guía a los negocios. Certifica y sube facturas por cobrar, accede a capital con confianza y tecnología sobre Stellar. Factoring sin bancos.",
  keywords: [
    "factoring",
    "certificación de facturas",
    "Stellar",
    "RWA",
    "liquidez",
    "PyME",
    "facturas por cobrar",
    "financiamiento PyME",
  ],
  authors: [{ name: "Faro Protocol" }],
  creator: "Faro Protocol",
  publisher: "Faro Protocol",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: "Faro",
    title: "Faro | Liquidez y guía para tu negocio",
    description:
      "Certifica facturas, accede a capital con confianza y tecnología sobre Stellar. El faro que alumbra y guía tu negocio.",
    images: [
      {
        url: "/Farologo.png",
        width: 1200,
        height: 630,
        alt: "Faro - Liquidez y guía para tu negocio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faro | Liquidez y guía para tu negocio",
    description:
      "Certifica facturas, accede a capital con tecnología sobre Stellar. El faro que alumbra y guía tu negocio.",
    images: ["/Farologo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: "/Farologo.png", type: "image/png", sizes: "any" }],
    apple: [{ url: "/Farologo.png", type: "image/png", sizes: "180x180" }],
  },
  alternates: { canonical: siteUrl },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={plusJakarta.variable}>
      <body className="min-h-screen font-sans antialiased">
        <ClerkProvider>
          <ClientProviders>{children}</ClientProviders>
        </ClerkProvider>
      </body>
    </html>
  )
}

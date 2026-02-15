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

export const metadata: Metadata = {
  title: "Faro | Liquidez y guía para tu negocio",
  description:
    "Faro alumbra y guía a los negocios. Tokeniza facturas, accede a capital con confianza y tecnología sobre Stellar.",
  keywords: ["factoring", "tokenización", "Stellar", "RWA", "liquidez", "PyME"],
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

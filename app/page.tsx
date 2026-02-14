import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { FlowSection } from "@/components/landing/flow-section"
import { Features } from "@/components/landing/features"
import { OverlappingCards } from "@/components/landing/overlapping-cards"
import { FeatureDiagrams } from "@/components/landing/feature-diagrams"
import { MapSection } from "@/components/landing/map-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { TrustedBy } from "@/components/landing/trusted-by"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FlowSection />
      <Features />
      <OverlappingCards />
      <FeatureDiagrams />
      <MapSection />
      <HowItWorks />
      <TrustedBy />
      <Footer />
    </main>
  )
}

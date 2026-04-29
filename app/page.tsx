import Hero from '@/components/Hero'
import IntroSection from '@/components/IntroSection'
import AboutSection from '@/components/AboutSection'
import AndAlso from '@/components/AndAlso'
import Services from '@/components/Services'
import Testimonials from '@/components/Testimonials'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroSection />
      <AboutSection />
      <AndAlso />
      <Services />
      <Testimonials />
      <CTASection />
      <Footer />
    </>
  )
}

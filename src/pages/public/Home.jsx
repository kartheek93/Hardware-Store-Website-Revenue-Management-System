import { Hero } from '@/components/public/Hero'
import { CategoryGrid } from '@/components/public/CategoryGrid'
import { BrandStrip } from '@/components/public/BrandStrip'
import { WhatsAppCTA } from '@/components/public/WhatsAppCTA'
import { Testimonials } from '@/components/public/Testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <BrandStrip />
      <WhatsAppCTA />
      <Testimonials />
    </>
  )
}

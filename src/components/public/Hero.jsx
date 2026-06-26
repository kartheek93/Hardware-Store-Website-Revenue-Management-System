import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { whatsappLink } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/shared/icons'
import { Tilt } from '@/components/shared/Tilt'
import { Appear } from '@/components/shared/Reveal'
import { SITE_IMAGES } from '@/lib/categories'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle warm wash + grid texture — restrained, not decorative noise */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-50/60 to-background" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#1F1E1C 1px, transparent 1px), linear-gradient(90deg, #1F1E1C 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="container-site relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div className="max-w-xl">
          <Appear as="span" className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            <MapPin className="h-3.5 w-3.5" /> Serving Hyderabad & surrounding areas
          </Appear>

          <Appear delay={0.08} as="h1" className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Your Trusted Hardware Partner in{' '}
            <span className="text-primary">Hyderabad</span>
          </Appear>

          <Appear delay={0.16} as="p" className="mt-5 text-lg leading-relaxed text-secondary-700">
            Paints, Iron &amp; Steel, Hardware, Tools — everything for your project,
            under one roof. Quality brands, fair prices, and special rates for
            contractors &amp; builders.
          </Appear>

          <Appear delay={0.24} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-600 active:bg-primary-700"
            >
              View Products <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href={whatsappLink('Hi, I have a bulk order inquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1faa54]"
            >
              <WhatsAppIcon className="h-5 w-5" /> Bulk Order on WhatsApp
            </a>
          </Appear>

          <Appear delay={0.32} as="dl" className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {[
              ['500+', 'Products stocked'],
              ['4', 'Categories'],
              ['100%', 'Trusted brands'],
            ].map(([num, label]) => (
              <div key={label}>
                <dt className="text-2xl font-extrabold tracking-tight text-foreground">{num}</dt>
                <dd className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</dd>
              </div>
            ))}
          </Appear>
        </div>

        {/* Visual — real store photo with brand scrim (3D tilt) */}
        <div className="relative">
          <Tilt max={12} scale={1.02} glare className="rounded-3xl">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#D85A30] to-[#5F5E5A] shadow-2xl">
            <img
              src={SITE_IMAGES.hero}
              alt="Sri Manikanta Paints, Iron & Hardware store"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            {/* warm brand scrim for cohesion + legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1E1C]/80 via-[#1F1E1C]/10 to-[#D85A30]/25" />

            {/* brand label bottom-left */}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-lg font-extrabold tracking-tight text-white drop-shadow">
                Sri Manikanta Hardware
              </p>
              <p className="mt-0.5 text-sm font-medium text-white/85 drop-shadow">
                Paints · Iron &amp; Steel · Hardware · Tools
              </p>
            </div>
          </div>
          </Tilt>
          {/* Floating accent card */}
          <div className="absolute -bottom-5 -left-5 z-10 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-md sm:block">
            <p className="text-xs font-medium text-muted-foreground">Open Mon–Sat</p>
            <p className="text-sm font-bold text-foreground">9:00 AM – 8:30 PM</p>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { ShieldCheck, Tag, Truck, Users, ArrowRight } from 'lucide-react'
import { STORE } from '@/lib/utils'
import { SITE_IMAGES } from '@/lib/categories'
import { Appear, Reveal } from '@/components/shared/Reveal'

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Trusted quality',
    text: 'Genuine products from brands like Asian Paints, Berger, Havells and Fevicol.',
  },
  {
    icon: Tag,
    title: 'Fair pricing',
    text: 'Honest rates for everyone, with special bulk pricing for contractors & builders.',
  },
  {
    icon: Truck,
    title: 'Always in stock',
    text: 'A wide, well-managed inventory so you rarely leave without what you came for.',
  },
  {
    icon: Users,
    title: 'Helpful service',
    text: 'Friendly staff who know the products and help you pick the right materials.',
  },
]

export default function About() {
  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/40">
        <Appear className="container-site py-14 sm:py-16">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            About us
          </span>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A dependable hardware store, built on trust
          </h1>
        </Appear>
      </div>

      <div className="container-site py-14 sm:py-16">
        <Reveal className="mb-12 overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-[#D85A30] to-[#5F5E5A]">
            <img
              src={SITE_IMAGES.about}
              alt="Tools and hardware at Sri Manikanta"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1E1C]/70 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-6 max-w-md text-lg font-bold tracking-tight text-white drop-shadow sm:text-xl">
              Quality materials, fair prices, trusted by Hyderabad.
            </p>
          </div>
        </Reveal>

        <Reveal className="grid gap-12 lg:grid-cols-3">
          {/* Story */}
          <div className="lg:col-span-2">
            <div className="prose-sm max-w-none space-y-4 text-[15px] leading-relaxed text-secondary-700">
              <p>
                <strong className="text-foreground">{STORE.name}</strong> has been serving
                {' '}Hyderabad and its surrounding areas for several years as a one-stop
                destination for paints, iron &amp; steel, hardware and tools.
              </p>
              <p>
                What started as a neighbourhood hardware shop has grown into a trusted
                supplier for homeowners, contractors and builders alike. We stock a wide
                range of products across four core categories, so whether you&apos;re
                painting a single room or sourcing steel for a construction site, you&apos;ll
                find what you need with us.
              </p>
              <p>
                Our focus has always been simple: genuine products, fair prices, and the kind
                of personal service that keeps customers coming back. Many of our regulars
                have been with us for years — and we&apos;re proud of that.
              </p>
            </div>

            {/* Stat strip */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ['Years in business', '10+ years'],
                ['Service area', 'Hyderabad & nearby'],
                ['Product categories', 'Paints · Iron · Hardware · Tools'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1.5 text-base font-bold tracking-tight text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Years in business shown is a placeholder — the owner can update it in <code>About.jsx</code>.
            </p>
          </div>

          {/* Why choose us */}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Why choose us</h2>
            <ul className="mt-5 space-y-4">
              {REASONS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-secondary-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-card sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Ready to start your project?
            </h3>
            <p className="mt-1 text-sm text-secondary-600">
              Browse our products or get in touch — we&apos;re happy to help.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              to="/products"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-600"
            >
              View Products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Contact us
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

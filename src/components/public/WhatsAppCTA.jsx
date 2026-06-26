import { whatsappLink } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/shared/icons'
import { Reveal } from '@/components/shared/Reveal'

export function WhatsAppCTA() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container-site">
        <Reveal className="relative overflow-hidden rounded-2xl bg-secondary-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          {/* warm accent glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Need a bulk order? Let&apos;s talk.
            </h2>
            <p className="mt-4 text-lg text-secondary-200">
              Contractors and builders get special rates. Message us directly on
              WhatsApp and we&apos;ll get back with a quote.
            </p>
            <a
              href={whatsappLink('Hi, I would like a quote for a bulk order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-13 items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#1faa54] hover:shadow-xl"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Message us on WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { STORE, whatsappLink } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/shared/icons'
import { Appear, Reveal } from '@/components/shared/Reveal'

const HOURS = [
  ['Monday – Saturday', '9:00 AM – 8:30 PM'],
  ['Sunday', '10:00 AM – 2:00 PM'],
]

export default function Contact() {
  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/40">
        <Appear className="container-site py-14 sm:py-16">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Contact &amp; location
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Visit us or send a message
          </h1>
          <p className="mt-2 max-w-2xl text-base text-secondary-700">
            Drop by the store, call us, or message us on WhatsApp for quick inquiries
            and bulk orders.
          </p>
        </Appear>
      </div>

      <Reveal className="container-site grid gap-8 py-12 lg:grid-cols-2">
        {/* Details */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Store details</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  <p className="mt-0.5 text-secondary-600">{STORE.address}</p>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  <a href={`tel:${STORE.phone}`} className="mt-0.5 block text-secondary-600 hover:text-primary">
                    {STORE.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a href={`mailto:${STORE.email}`} className="mt-0.5 block text-secondary-600 hover:text-primary">
                    {STORE.email}
                  </a>
                </div>
              </li>
            </ul>

            <a
              href={whatsappLink('Hi, I have an inquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1faa54]"
            >
              <WhatsAppIcon className="h-5 w-5" /> Message us on WhatsApp
            </a>
          </div>

          {/* Hours */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
              <Clock className="h-5 w-5 text-primary" /> Opening hours
            </h2>
            <dl className="mt-4 divide-y divide-border">
              {HOURS.map(([day, time]) => (
                <div key={day} className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-secondary-600">{day}</dt>
                  <dd className="font-semibold text-foreground">{time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Placeholder hours &amp; address — the owner can update these via the{' '}
              <code>.env</code> store settings or in <code>Contact.jsx</code>.
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <iframe
            title="Store location on Google Maps"
            src={STORE.mapsEmbed}
            className="h-full min-h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </Reveal>
    </div>
  )
}

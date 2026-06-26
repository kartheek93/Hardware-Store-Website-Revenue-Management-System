import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { STORE, whatsappLink } from '@/lib/utils'
import { WhatsAppIcon, StoreLogo } from '@/components/shared/icons'

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary-900 text-secondary-200">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-1">
          <StoreLogo className="[&_span]:text-white [&_.text-muted-foreground]:text-secondary-400" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-secondary-400">
            Your trusted partner for paints, iron &amp; steel, hardware and tools in
            Hyderabad. Quality brands at fair prices.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-secondary-300 transition-colors hover:text-primary-200"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Get in Touch</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
              <span className="text-secondary-300">{STORE.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary-300" />
              <a href={`tel:${STORE.phone}`} className="text-secondary-300 hover:text-primary-200">
                {STORE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary-300" />
              <a href={`mailto:${STORE.email}`} className="text-secondary-300 hover:text-primary-200">
                {STORE.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Find &amp; Order</h3>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href={whatsappLink('Hi, I have an inquiry.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1faa54]"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={STORE.mapsEmbed.replace('&output=embed', '').replace('?output=embed', '')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-sm text-secondary-300 transition-colors hover:text-primary-200"
            >
              <MapPin className="h-4 w-4" /> View on Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-secondary-400 sm:flex-row">
          <p>© 2025 Sri Manikanta Paints, Iron &amp; Hardware. All rights reserved.</p>
          <Link to="/owner/login" className="transition-colors hover:text-secondary-200">
            Owner Login
          </Link>
        </div>
      </div>
    </footer>
  )
}

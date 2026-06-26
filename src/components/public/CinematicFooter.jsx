import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MapPin, Phone, Mail, ExternalLink, ArrowUp } from 'lucide-react'
import { STORE, whatsappLink } from '@/lib/utils'
import { WhatsAppIcon, StoreLogo } from '@/components/shared/icons'

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

/**
 * Cinematic reveal footer (adapted from the 21st.dev "motion-footer" for
 * Vite/React). It sits fixed behind the page; a spacer reserves scroll room
 * so the content lifts away to expose it. Content parallaxes in via scroll.
 */
export function CinematicFooter() {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)

  const { scrollYProgress } = useScroll()
  const colY = useTransform(scrollYProgress, [0.82, 1], [60, 0])
  const colOpacity = useTransform(scrollYProgress, [0.82, 1], [0, 1])
  const markY = useTransform(scrollYProgress, [0.8, 1], [90, 0])
  const markOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1])

  // Measure footer height so the spacer reserves exactly the right scroll room.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      {/* Spacer in normal flow — gives the page room to scroll up & reveal */}
      <div aria-hidden style={{ height }} />

      <footer
        ref={ref}
        className="fixed inset-x-0 bottom-0 z-0 overflow-hidden bg-[#0c0b0a] text-secondary-200"
      >
        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          style={{ y: colY, opacity: colOpacity }}
          className="container-site relative grid gap-10 pb-2 pt-16 sm:grid-cols-2 lg:grid-cols-4"
        >
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
              <button
                onClick={scrollTop}
                className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-secondary-400 transition-colors hover:text-white"
              >
                <ArrowUp className="h-4 w-4" /> Back to top
              </button>
            </div>
          </div>
        </motion.div>

        {/* Oversized brand wordmark */}
        <motion.div
          style={{ y: markY, opacity: markOpacity }}
          className="pointer-events-none select-none px-2"
        >
          <p className="bg-gradient-to-b from-white/10 to-white/0 bg-clip-text text-center text-[18vw] font-black uppercase leading-[0.85] tracking-tighter text-transparent">
            Manikanta
          </p>
        </motion.div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/10">
          <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-secondary-400 sm:flex-row">
            <p>© 2025 Sri Manikanta Paints, Iron &amp; Hardware. All rights reserved.</p>
            <Link to="/owner/login" className="transition-colors hover:text-secondary-200">
              Owner Login
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}

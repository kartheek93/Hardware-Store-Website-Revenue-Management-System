import { Star } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/shared/Reveal'
import { Tilt } from '@/components/shared/Tilt'

const REVIEWS = [
  {
    name: 'Ramesh K.',
    role: 'Building Contractor',
    rating: 5,
    quote:
      'Best rates for TMT steel and cement in the area. They always have stock ready and the bulk pricing for contractors is genuinely fair.',
  },
  {
    name: 'Priya S.',
    role: 'Homeowner',
    rating: 5,
    quote:
      'Repainted our whole house with Asian Paints from here. The staff helped pick the right shades and the delivery was on time.',
  },
  {
    name: 'Imran A.',
    role: 'Interior Designer',
    rating: 4,
    quote:
      'Reliable for hardware and fittings. Wide selection of hinges, locks and tools — my go-to store for project materials in Hyderabad.',
  },
]

function Stars({ count }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < count ? 'h-4 w-4 fill-accent text-accent' : 'h-4 w-4 fill-secondary-100 text-secondary-200'
          }
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-16 sm:py-20">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            What customers say
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by builders &amp; homeowners
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <StaggerItem key={r.name} className="h-full">
            <Tilt max={6} className="h-full rounded-xl">
            <figure
              className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <Stars count={r.rating} />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-secondary-700">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary">
                  {r.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{r.name}</span>
                  <span className="block text-xs text-muted-foreground">{r.role}</span>
                </span>
              </figcaption>
            </figure>
            </Tilt>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Placeholder reviews — the store owner can replace these with real customer testimonials.
        </p>
      </div>
    </section>
  )
}

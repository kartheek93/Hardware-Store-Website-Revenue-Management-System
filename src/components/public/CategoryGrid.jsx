import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_META } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { Tilt } from '@/components/shared/Tilt'
import { Reveal, Stagger, StaggerItem } from '@/components/shared/Reveal'

export function CategoryGrid() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            What we stock
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything for your project
          </h2>
          <p className="mt-3 text-base text-secondary-700">
            Four categories, one dependable hardware store. Browse what you need.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_META.map(({ key, icon: Icon, blurb, tagline, gradient, images }) => (
            <StaggerItem key={key} className="h-full">
            <Tilt max={8} className="h-full rounded-2xl">
            <Link
              to={`/products?category=${encodeURIComponent(key)}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors duration-200 hover:border-primary-200 hover:shadow-lg"
            >
              {/* Real photo with brand gradient scrim */}
              <div className={cn('relative h-36 overflow-hidden bg-gradient-to-br', gradient)}>
                <img
                  src={images[0]}
                  alt={key}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                {/* gradient scrim for brand tint + legibility */}
                <div className={cn('absolute inset-0 bg-gradient-to-t opacity-80 mix-blend-multiply', gradient)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* solid icon chip */}
                <span className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-foreground shadow-sm backdrop-blur transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-5.5 w-5.5" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {tagline}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">{key}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-secondary-600">{blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  View Products
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

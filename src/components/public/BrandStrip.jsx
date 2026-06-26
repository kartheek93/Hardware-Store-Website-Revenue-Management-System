const BRANDS = [
  'Asian Paints',
  'Berger Paints',
  'Nippon Paint',
  'Dulux',
  'Fevicol',
  'Anchor',
  'Havells',
]

function BrandBadge({ name }) {
  return (
    <div className="flex h-16 min-w-[150px] items-center justify-center rounded-lg border border-border bg-card px-6">
      <span className="whitespace-nowrap text-sm font-bold uppercase tracking-wide text-secondary-500">
        {name}
      </span>
    </div>
  )
}

export function BrandStrip() {
  return (
    <section className="border-y border-border bg-muted/40 py-12">
      <div className="container-site">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Trusted brands we stock
        </p>

        {/* Marquee on small screens, static grid on large */}
        <div className="relative mt-7 overflow-hidden lg:hidden">
          <div className="flex w-max animate-marquee gap-4">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <BrandBadge key={`${b}-${i}`} name={b} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
        </div>

        <div className="mt-7 hidden flex-wrap items-center justify-center gap-4 lg:flex">
          {BRANDS.map((b) => (
            <BrandBadge key={b} name={b} />
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Placeholder wordmarks — the owner can swap in real brand logos later.
        </p>
      </div>
    </section>
  )
}

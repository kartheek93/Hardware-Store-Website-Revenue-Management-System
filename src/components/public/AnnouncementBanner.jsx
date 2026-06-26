import { useState } from 'react'
import { X } from 'lucide-react'

// ── EDIT YOUR ANNOUNCEMENT HERE ──────────────────────────────
// The store owner can change this single object to update the banner.
// Set `enabled: false` to hide it entirely.
const ANNOUNCEMENT = {
  enabled: true,
  text: 'Summer Sale: Up to 20% off on Asian Paints — valid till 30th June',
  linkLabel: 'Learn more',
  linkHref: '/products?category=Paints',
}
// ─────────────────────────────────────────────────────────────

export function AnnouncementBanner() {
  const [open, setOpen] = useState(true)
  if (!ANNOUNCEMENT.enabled || !open) return null

  return (
    <div className="relative bg-secondary-900 text-secondary-50">
      <div className="container-site flex items-center justify-center gap-3 py-2 pr-8 text-center text-xs sm:text-sm">
        <p className="font-medium">
          {ANNOUNCEMENT.text}
          {ANNOUNCEMENT.linkHref && (
            <a
              href={ANNOUNCEMENT.linkHref}
              className="ml-2 font-semibold text-primary-200 underline-offset-2 hover:underline"
            >
              {ANNOUNCEMENT.linkLabel}
            </a>
          )}
        </p>
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-secondary-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

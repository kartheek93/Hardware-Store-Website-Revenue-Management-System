import { Paintbrush, Layers, Wrench, Hammer } from 'lucide-react'

/** Build a sized Unsplash CDN URL. */
const u = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`

/**
 * Single source of truth for the four product categories — keep the
 * `key` values in sync with the DB CHECK constraint in supabase/schema.sql.
 *
 * `images` are real, relevant photos (verified). `gradient` is used as an
 * overlay tint for brand cohesion and as a fallback if a photo fails to load.
 */
export const CATEGORY_META = [
  {
    key: 'Paints',
    icon: Paintbrush,
    blurb: 'Asian Paints, Berger & more — interior & exterior finishes.',
    tagline: 'Interior & exterior',
    gradient: 'from-[#D85A30] via-[#E4956F] to-[#BA7517]',
    images: [u('1525909002-1b05e0c869d8'), u('1535673774336-ef95d2851cf3')],
  },
  {
    key: 'Iron & Steel',
    icon: Layers,
    blurb: 'TMT rods, sheets, angles and channels for every build.',
    tagline: 'Rods · sheets · angles',
    gradient: 'from-[#3A3937] via-[#5F5E5A] to-[#84837E]',
    images: [u('1530863506128-dc9eb5c3e0fc'), u('1623428454598-1bfe414bac03')],
  },
  {
    key: 'Hardware',
    icon: Wrench,
    blurb: 'Nuts, bolts, hinges, locks and fixtures you can rely on.',
    tagline: 'Fittings & fixtures',
    gradient: 'from-[#BA7517] via-[#C98722] to-[#71470E]',
    images: [u('1607733067403-a0396fa4d3d0'), u('1605701249987-f0bb9b505d06')],
  },
  {
    key: 'Tools',
    icon: Hammer,
    blurb: 'Hand tools, power tools and safety equipment.',
    tagline: 'Hand & power tools',
    gradient: 'from-[#B8481F] via-[#D85A30] to-[#5F5E5A]',
    images: [u('1606676539940-12768ce0e762'), u('1546827209-a218e99fdbe9')],
  },
]

/** Marketing photos used in the hero, about page, etc. */
export const SITE_IMAGES = {
  hero: u('1765744893064-dce3184289ef', 1000), // hardware store shelves
  about: u('1546827209-a218e99fdbe9', 1000), // tools on a workbench
}

export function categoryMeta(key) {
  return CATEGORY_META.find((c) => c.key === key)
}

/** Tailwind gradient classes for a category (falls back to the brand orange). */
export function categoryGradient(key) {
  return categoryMeta(key)?.gradient || 'from-primary-400 via-primary to-accent'
}

/** Primary photo for a category. */
export function categoryImage(key) {
  return categoryMeta(key)?.images?.[0] || ''
}

/** Stable per-product photo pick from a category's image set (avoids repeats). */
export function productFallbackImage(product) {
  const imgs = categoryMeta(product?.category)?.images
  if (!imgs?.length) return ''
  const s = String(product?.id || product?.name || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return imgs[h % imgs.length]
}

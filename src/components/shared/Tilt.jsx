import { useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pointer-driven 3D tilt wrapper. Rotates its children toward the cursor on a
 * perspective plane, with a subtle lift. Pure CSS transforms — performant and
 * accessible (no tilt for users who prefer reduced motion).
 *
 * @param {number} max    max rotation in degrees (default 9)
 * @param {number} scale  hover scale (default 1.03)
 * @param {boolean} glare adds a soft moving highlight
 */
export function Tilt({ children, className, max = 9, scale = 1.03, glare = false }) {
  const ref = useRef(null)
  const glareRef = useRef(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  function handleMove(e) {
    const el = ref.current
    if (!el || prefersReduced) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rotateX = (py - 0.5) * -2 * max
    const rotateY = (px - 0.5) * 2 * max
    el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`
    if (glareRef.current) {
      glareRef.current.style.opacity = '1'
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.35), transparent 55%)`
    }
  }

  function reset() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
    if (glareRef.current) glareRef.current.style.opacity = '0'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={cn('relative will-change-transform', className)}
      style={{ transition: 'transform 200ms ease-out', transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200"
        />
      )}
    </div>
  )
}

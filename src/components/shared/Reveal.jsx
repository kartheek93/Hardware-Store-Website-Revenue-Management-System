import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Scroll-triggered entrance. Fades + slides its children into view once.
 *   <Reveal delay={0.1}>…</Reveal>
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.6,
  once = true,
  as = 'div',
}) {
  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Entrance that runs immediately on mount (for above-the-fold hero content).
 */
export function Appear({ children, className, delay = 0, y = 24, duration = 0.6, as = 'div' }) {
  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Stagger container — children using `revealItem` variants animate in sequence.
 */
export function Stagger({ children, className, stagger = 0.08, once = true }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export const revealItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

/** A motion.div pre-bound to the stagger item variants. */
export function StaggerItem({ children, className }) {
  return (
    <motion.div className={className} variants={revealItem}>
      {children}
    </motion.div>
  )
}

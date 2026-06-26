import { supabase } from '@/lib/supabase'

const envEmails = import.meta.env.VITE_OWNER_EMAILS ? import.meta.env.VITE_OWNER_EMAILS.split(',') : []
const envPhones = import.meta.env.VITE_OWNER_PHONES ? import.meta.env.VITE_OWNER_PHONES.split(',') : []

/**
 * Hardcoded / env "bootstrap" owners. These always work as a safety net so you
 * can never lock yourself out — even if the database isn't reachable.
 * Additional owners are managed in the Supabase `app_owners` table (no redeploy
 * needed). See checkIsOwner() below.
 */
export const ALLOWED_OWNERS = {
  emails: [
    'vkartheek0000@gmail.com',
    ...envEmails.map((e) => e.trim().toLowerCase()).filter(Boolean),
  ],
  phones: [
    '+919381861672',
    '9381861672',
    ...envPhones.map((p) => p.trim()).filter(Boolean),
  ],
}

/**
 * Synchronous bootstrap check against the hardcoded/env allowlist only.
 * @param {object} user - Supabase user object
 * @returns {boolean}
 */
export function isOwner(user) {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  const phone = user.phone?.trim()

  const isEmailAllowed = email && ALLOWED_OWNERS.emails.includes(email)

  const isPhoneAllowed =
    phone &&
    (ALLOWED_OWNERS.phones.includes(phone) ||
      ALLOWED_OWNERS.phones.includes(phone.replace(/^\+91/, '')) ||
      ALLOWED_OWNERS.phones
        .map((p) => p.replace(/^\+91/, ''))
        .includes(phone.replace(/^\+91/, '')))

  return Boolean(isEmailAllowed || isPhoneAllowed)
}

/**
 * Full owner check: bootstrap allowlist first (instant, no lockout), then the
 * Supabase `app_owners` table via a secure SECURITY DEFINER function. This is
 * how you add new owners without a redeploy — just insert a row in Supabase.
 *
 * @param {object} user - Supabase user object
 * @returns {Promise<boolean>}
 */
export async function checkIsOwner(user) {
  if (!user) return false
  if (isOwner(user)) return true // bootstrap owner — always allowed

  try {
    const { data, error } = await supabase.rpc('check_is_owner')
    if (error) {
      // Table/function not set up yet, or RPC failed — fall back to bootstrap only.
      console.warn('[owners] check_is_owner RPC unavailable:', error.message)
      return false
    }
    return data === true
  } catch (err) {
    console.warn('[owners] owner check failed:', err)
    return false
  }
}

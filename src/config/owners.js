const envEmails = import.meta.env.VITE_OWNER_EMAILS ? import.meta.env.VITE_OWNER_EMAILS.split(',') : []
const envPhones = import.meta.env.VITE_OWNER_PHONES ? import.meta.env.VITE_OWNER_PHONES.split(',') : []

export const ALLOWED_OWNERS = {
  emails: [
    'vkartheek0000@gmail.com',
    ...envEmails.map(e => e.trim().toLowerCase()).filter(Boolean)
  ],
  phones: [
    '+919381861672',
    '9381861672',
    ...envPhones.map(p => p.trim()).filter(Boolean)
  ]
}

/**
 * Checks if a given Supabase user is on the allowed owner list.
 * Supports email checks and phone number checks.
 * @param {object} user - Supabase user object
 * @returns {boolean}
 */
export function isOwner(user) {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  const phone = user.phone?.trim()

  const isEmailAllowed = email && ALLOWED_OWNERS.emails.includes(email)
  
  // Check phone directly or by comparing stripped 10-digit formats
  const isPhoneAllowed = phone && (
    ALLOWED_OWNERS.phones.includes(phone) ||
    ALLOWED_OWNERS.phones.includes(phone.replace(/^\+91/, '')) ||
    ALLOWED_OWNERS.phones.map(p => p.replace(/^\+91/, '')).includes(phone.replace(/^\+91/, ''))
  )

  return Boolean(isEmailAllowed || isPhoneAllowed)
}

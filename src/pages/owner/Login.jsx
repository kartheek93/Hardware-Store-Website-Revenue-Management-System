import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Loader2, Mail, Lock, AlertCircle, ShieldCheck, Phone } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn, STORE } from '@/lib/utils'
import { StoreLogo } from '@/components/shared/icons'
import { checkIsOwner } from '@/config/owners'

// Gradient for the sliding 3D panel. Swap this one line for the brand look:
//   brand orange → 'linear-gradient(135deg, #D85A30 0%, #BA7517 100%)'
const PANEL_GRADIENT = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'

/* ---------- small brand icons for the social row ---------- */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  )
}
function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1DA1F2">
      <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.93 4.93 0 0 0 2.16-2.72c-.95.56-2 .96-3.13 1.18a4.92 4.92 0 0 0-8.39 4.49A13.97 13.97 0 0 1 1.64 3.16a4.92 4.92 0 0 0 1.52 6.57c-.8-.02-1.56-.24-2.22-.6v.06a4.93 4.93 0 0 0 3.95 4.83 4.96 4.96 0 0 1-2.21.08 4.93 4.93 0 0 0 4.6 3.42A9.87 9.87 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.05 0 14-7.5 14-14v-.64c.96-.7 1.8-1.56 2.46-2.54Z" />
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#0A66C2">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
  )
}

function SocialRow({ onSocial }) {
  const socials = [
    { key: 'google', Icon: GoogleIcon },
    { key: 'facebook', Icon: FacebookIcon },
    { key: 'twitter', Icon: TwitterIcon },
    { key: 'linkedin', Icon: LinkedInIcon },
  ]
  return (
    <div className="flex items-center gap-3">
      {socials.map(({ key, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={onSocial}
          aria-label={`Continue with ${key}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-secondary-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}

/* ---------- a pill input matching the 21st.dev look ---------- */
function PillInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-secondary-100 px-4">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        {...props}
        className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const { info } = useToast()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // OTP auth specific states
  const [authMethod, setAuthMethod] = useState('password') // 'password' | 'otp'
  const [otpMethod, setOtpMethod] = useState('email') // 'email' | 'phone'
  const [otpStep, setOtpStep] = useState('request') // 'request' | 'verify'
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const from = location.state?.from || '/owner/dashboard'
  const right = mode === 'signup'

  // Redirect on auth success if authorized owner
  useEffect(() => {
    if (authLoading || !user) return
    let active = true
    checkIsOwner(user).then((ok) => {
      if (!active) return
      if (ok) {
        navigate(from, { replace: true })
      } else {
        setError('Access Denied: You do not have owner privileges.')
        supabase.auth.signOut()
      }
    })
    return () => {
      active = false
    }
  }, [authLoading, user, from, navigate])

  // Capture redirection errors
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error)
    }
  }, [location])

  // reset transient messages when toggling sides or method
  useEffect(() => {
    setError('')
    setOtpStep('request')
    setOtpCode('')
  }, [mode, authMethod, otpMethod])

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured) {
      setError('Supabase is not connected yet. Add your keys to .env (see README).')
      return
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) {
        setError('Invalid email or password.')
        return
      }
      
      const loggedUser = data?.user
      if (loggedUser) {
        if (await checkIsOwner(loggedUser)) {
          navigate(from, { replace: true })
        } else {
          setError('Access Denied: You do not have owner privileges.')
          await supabase.auth.signOut()
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendOTP(e) {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured) {
      setError('Supabase is not connected yet. Add your keys to .env.')
      return
    }

    const target = otpMethod === 'email' ? email.trim() : phone.trim()
    if (!target) {
      setError(`Please enter your ${otpMethod}.`)
      return
    }

    setSubmitting(true)
    try {
      const payload = {}
      if (otpMethod === 'email') {
        payload.email = target
      } else {
        let cleanPhone = target.replace(/\s+/g, '')
        if (cleanPhone.length === 10) {
          cleanPhone = '+91' + cleanPhone
        }
        payload.phone = cleanPhone
        setPhone(cleanPhone)
      }

      const { error: otpError } = await supabase.auth.signInWithOtp(payload)
      if (otpError) {
        setError(otpError.message)
        return
      }

      setOtpStep('verify')
      info(`OTP code has been sent to your ${otpMethod}.`)
    } catch {
      setError('Failed to send OTP code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault()
    setError('')
    if (!otpCode.trim()) {
      setError('Please enter the OTP verification code.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        token: otpCode.trim(),
      }

      if (otpMethod === 'email') {
        payload.email = email.trim()
        payload.type = 'magiclink'
      } else {
        payload.phone = phone.trim()
        payload.type = 'sms'
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp(payload)
      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired OTP code.')
        return
      }

      const loggedUser = data?.user
      if (loggedUser) {
        if (await checkIsOwner(loggedUser)) {
          navigate(from, { replace: true })
        } else {
          setError('Access Denied: You do not have owner privileges.')
          await supabase.auth.signOut()
        }
      }
    } catch {
      setError('Failed to verify OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onSocial = () =>
    info('Social login isn’t enabled — please sign in with email & password.')

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-100">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  /* ---------- shared form bodies (reused by desktop slider + mobile) ---------- */
  const renderSignInForm = () => {
    if (authMethod === 'password') {
      return (
        <form onSubmit={handleSignIn} className="flex w-full flex-col items-center gap-4 animate-in fade-in duration-300" noValidate>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Sign in</h1>
          <SocialRow onSocial={onSocial} />
          <p className="text-xs text-muted-foreground">or use your email account</p>

          {/* Auth method tab selector */}
          <div className="mb-1 flex w-full rounded-full bg-secondary-100 p-1">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={cn(
                'h-9 flex-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider',
                authMethod === 'password' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={cn(
                'h-9 flex-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider',
                authMethod === 'otp' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              OTP Code
            </button>
          </div>

          {error && (
            <div className="flex w-full items-start gap-2 rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-xs text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="w-full space-y-3">
            <PillInput
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PillInput
              icon={Lock}
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex h-12 w-44 items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:brightness-105 active:brightness-95 disabled:opacity-60"
            style={{ background: PANEL_GRADIENT }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Login
          </button>
        </form>
      )
    }

    // OTP Flow - Request Step
    if (otpStep === 'request') {
      return (
        <form onSubmit={handleSendOTP} className="flex w-full flex-col items-center gap-4 animate-in fade-in duration-300" noValidate>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Sign in with OTP</h1>
          <p className="text-xs text-muted-foreground text-center">Receive a verification code on your email or phone</p>

          {/* Auth method tab selector */}
          <div className="mb-1 flex w-full rounded-full bg-secondary-100 p-1">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={cn(
                'h-9 flex-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider',
                authMethod === 'password' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={cn(
                'h-9 flex-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider',
                authMethod === 'otp' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              OTP Code
            </button>
          </div>

          {/* OTP Method sub-selector (email vs phone) */}
          <div className="flex w-44 rounded-full bg-secondary-200/50 p-0.5 border border-secondary-200/20">
            <button
              type="button"
              onClick={() => setOtpMethod('email')}
              className={cn(
                'h-7 flex-1 rounded-full text-[10px] font-bold transition-all uppercase tracking-wider',
                otpMethod === 'email' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setOtpMethod('phone')}
              className={cn(
                'h-7 flex-1 rounded-full text-[10px] font-bold transition-all uppercase tracking-wider',
                otpMethod === 'phone' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              Phone
            </button>
          </div>

          {error && (
            <div className="flex w-full items-start gap-2 rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-xs text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full">
            {otpMethod === 'email' ? (
              <PillInput
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <PillInput
                icon={Phone}
                type="tel"
                autoComplete="tel"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex h-12 w-44 items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:brightness-105 active:brightness-95 disabled:opacity-60"
            style={{ background: PANEL_GRADIENT }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send OTP
          </button>
        </form>
      )
    }

    // OTP Flow - Verify Step
    return (
      <form onSubmit={handleVerifyOTP} className="flex w-full flex-col items-center gap-4 animate-in fade-in duration-300" noValidate>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Verify OTP</h1>
        <p className="text-xs text-muted-foreground text-center">
          We sent a verification code to <br />
          <span className="font-semibold text-foreground">
            {otpMethod === 'email' ? email : phone}
          </span>
        </p>

        {error && (
          <div className="flex w-full items-start gap-2 rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="w-full">
          <PillInput
            icon={Lock}
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit OTP Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:brightness-105 active:brightness-95 disabled:opacity-60"
            style={{ background: PANEL_GRADIENT }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify & Login
          </button>

          <button
            type="button"
            onClick={() => setOtpStep('request')}
            className="text-xs font-semibold text-primary hover:underline py-1"
          >
            Change details or resend
          </button>
        </div>
      </form>
    )
  }

  const SignInBody = renderSignInForm()

  const SignUpBody = (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary">
        <ShieldCheck className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Need an account?</h1>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        Owner accounts are created by the administrator — there’s no public sign-up.
        Please reach out to your admin to have your login created, then sign in with
        the credentials you receive.
      </p>
      <a
        href={`mailto:${STORE.email}?subject=${encodeURIComponent('Owner account request — MahairaSystem')}`}
        className="mt-1 inline-flex h-12 w-52 items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:brightness-105 active:brightness-95"
        style={{ background: PANEL_GRADIENT }}
      >
        <Mail className="h-4 w-4" /> Contact admin
      </a>
      <button
        type="button"
        onClick={() => setMode('signin')}
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Back to sign in
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary-100 px-4 py-10">
      <Link to="/" className="mb-8">
        <StoreLogo />
      </Link>

      {/* ===================== DESKTOP: 3D sliding double-panel ===================== */}
      <div className="relative hidden h-[540px] w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl md:block">
        {/* Sign In form half */}
        <div
          className={cn(
            'absolute left-0 top-0 flex h-full w-1/2 items-center justify-center px-12 transition-all duration-700 ease-in-out',
            right ? 'translate-x-full opacity-0 z-10' : 'translate-x-0 opacity-100 z-20'
          )}
        >
          {SignInBody}
        </div>

        {/* Sign Up form half */}
        <div
          className={cn(
            'absolute left-0 top-0 flex h-full w-1/2 items-center justify-center px-12 transition-all duration-700 ease-in-out',
            right ? 'translate-x-full opacity-100 z-20' : 'translate-x-0 opacity-0 z-10'
          )}
        >
          {SignUpBody}
        </div>

        {/* Sliding gradient overlay */}
        <div
          className={cn(
            'absolute top-0 z-30 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out',
            right ? 'left-0 -translate-x-0' : 'left-1/2'
          )}
          style={{ transform: right ? 'translateX(0)' : 'translateX(0)' }}
        >
          <div className="relative h-full w-full text-white" style={{ background: PANEL_GRADIENT }}>
            {/* soft decorative glows */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

            {/* Overlay content swaps with mode */}
            <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
              {right ? (
                <>
                  <h2 className="text-3xl font-extrabold tracking-tight">One of us?</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/90">
                    Welcome back! Sign in to continue managing your store.
                  </p>
                  <button
                    onClick={() => setMode('signin')}
                    className="mt-7 inline-flex h-11 w-40 items-center justify-center rounded-full border-2 border-white/80 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-white/10"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-extrabold tracking-tight">New here?</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/90">
                    Owner accounts are created by the administrator. Sign in with your
                    provided credentials.
                  </p>
                  <button
                    onClick={() => setMode('signup')}
                    className="mt-7 inline-flex h-11 w-40 items-center justify-center rounded-full border-2 border-white/80 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-white/10"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE: stacked card with toggle ===================== */}
      <div className="w-full max-w-sm rounded-2xl bg-card p-7 shadow-xl md:hidden">
        <div className="mb-5 flex rounded-full bg-secondary-100 p-1">
          <button
            onClick={() => setMode('signin')}
            className={cn(
              'h-9 flex-1 rounded-full text-sm font-semibold transition-all',
              !right ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={cn(
              'h-9 flex-1 rounded-full text-sm font-semibold transition-all',
              right ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            Sign up
          </button>
        </div>
        {right ? SignUpBody : SignInBody}
      </div>

      <Link
        to="/"
        className="mt-7 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to website
      </Link>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { loginUser, signupUser } from '../../services/api.js'
import useAuth from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'

function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const isLogin = modeParam !== 'signup'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()

  const handleModeChange = (targetMode) => {
    setError(null)
    setInfoMessage(null)
    searchParams.set('mode', targetMode)
    setSearchParams(searchParams, { replace: true })
  }

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'google_account_requires_existing_login') {
        setError('An account with this email already exists. Please log in with your password.')
      } else if (errorParam === 'google_auth_denied') {
        setError('Google sign-in was canceled.')
      } else if (errorParam === 'oauth_state_invalid') {
        setError('Authentication session expired. Please try again.')
      } else {
        setError('Google authentication failed. Please try again.')
      }
      searchParams.delete('error')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleForgotPassword = () => {
    setError(null)
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your email address above to receive reset instructions.')
      return
    }
    setInfoMessage(`Password reset instructions sent to ${email.trim()}.`)
  }

  const handleGoogleAuth = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    window.location.href = `${API_BASE_URL}/v1/auth/google`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfoMessage(null)

    const trimmedEmail = email.trim()
    const trimmedName = name.trim()

    // Client-side validation
    if (!isLogin && !trimmedName) {
      setError('Please enter your full name.')
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        await loginUser({ email: trimmedEmail, password })
      } else {
        await signupUser({ name: trimmedName, email: trimmedEmail, password })
      }

      await refreshUser()
      const destination =
        location.state?.from?.pathname
          ? `${location.state.from.pathname}${location.state.from.search || ''}`
          : ROUTES.dashboard
      navigate(destination, { replace: true })
    } catch (err) {
      if (err.status === 401 && isLogin) {
        setError('Invalid email or password.')
      } else if (err.status === 409 && !isLogin) {
        setError('An account with this email already exists.')
      } else if (err.body?.message) {
        setError(err.body.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#070b14] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Dynamic Cyber Security Ambient Light Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Left Cyan Aura */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px]" />

        {/* Center Blue Spotlight behind Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-blue-600/15 blur-[150px]" />

        {/* Bottom-Right Indigo Aura */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />

        {/* Precision Micro-Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Subtle Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/60 via-transparent to-[#070b14]/90" />
      </div>

      {/* Outer Frosted Glass Shell (Matching the reference design) */}
      <div className="relative z-10 w-full max-w-[560px] my-auto rounded-[32px] sm:rounded-[40px] border border-slate-700/50 bg-slate-900/30 backdrop-blur-xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] p-4 sm:p-7 md:p-8 flex flex-col items-center">
        {/* Top Minimal Navigation Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-4 sm:mb-5">
          <Link
            to={ROUTES.landing}
            className="group inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 group-hover:bg-slate-700/80 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/70 text-[11px] font-semibold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Sentinel<span className="text-blue-400">AI</span>
            </span>
          </div>
        </div>

        {/* Floating Dark Glassmorphic Card */}
        <div className="w-full max-w-[440px] rounded-[26px] sm:rounded-[28px] border border-slate-700/70 bg-[#0d121f]/85 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] p-6 sm:p-8 text-white">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-white leading-tight">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {isLogin
                ? 'Enter your details below to sign in into your account'
                : 'Enter your details below to create your account'}
            </p>
          </div>

          {/* Social Sign In Button (Pill shape) */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-2.5 sm:py-3 px-4 rounded-full border border-slate-700/80 bg-slate-850/50 hover:bg-slate-800/80 active:scale-[0.99] text-slate-200 text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Minimal Elegant Divider: ——— or ——— */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-[1px] bg-slate-700/60" />
            <span className="px-3 text-[11px] font-normal text-slate-400 lowercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-[1px] bg-slate-700/60" />
          </div>

          {/* Authentication Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all disabled:opacity-50"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-4 pr-11 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all disabled:opacity-50"
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-4 pr-11 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all disabled:opacity-50"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl bg-red-950/70 p-3 border border-red-500/30 text-red-200 flex items-start gap-2.5 text-xs animate-in fade-in duration-200"
              >
                <AlertCircle
                  className="h-4 w-4 text-red-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Info Message */}
            {infoMessage && (
              <div
                role="status"
                className="rounded-2xl bg-blue-950/70 p-3 border border-blue-500/30 text-blue-200 flex items-start gap-2.5 text-xs animate-in fade-in duration-200"
              >
                <CheckCircle2
                  className="h-4 w-4 text-blue-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{infoMessage}</span>
              </div>
            )}

            {/* Primary Action Button (Rounded Pill Button) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 sm:py-3.5 px-6 rounded-full text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    <span>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  </>
                ) : isLogin ? (
                  'Login'
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Footer Mode Switcher */}
          <div className="mt-6 text-center text-xs text-slate-300">
            <span>
              {isLogin ? "Don't Have An Account?" : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => handleModeChange(isLogin ? 'signup' : 'login')}
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors ml-1 cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

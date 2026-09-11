import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'

function RequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-3 font-sans selection:bg-blue-600 selection:text-white">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800/80 shadow-lg backdrop-blur-md">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-xs font-medium text-slate-300 tracking-wide">
            Checking session...
          </span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${ROUTES.auth}?mode=login`}
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}

export default RequireAuth

import { useAuthContext } from '../context/AuthContext.jsx'

function useAuth() {
  return useAuthContext()
}

export default useAuth

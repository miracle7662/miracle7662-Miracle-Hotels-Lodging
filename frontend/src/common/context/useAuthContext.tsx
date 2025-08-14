import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  Suspense,
} from 'react'
import { Preloader, PreloaderFull } from '@/components/Misc/Preloader'

type User = {
  id: number
  username: string
  email?: string
  password: string
  name: string
  role: string
  token: string
}

const AuthContext = createContext<any>({})

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = 'WINDOW_AUTH_SESSION'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(
    localStorage.getItem(authSessionKey)
      ? JSON.parse(localStorage.getItem(authSessionKey) || '{}')
      : undefined,
  )

  console.log('🔍 AuthProvider - Initial user state:', user);
  console.log('🔍 AuthProvider - localStorage authSessionKey:', localStorage.getItem(authSessionKey));
  console.log('🔍 AuthProvider - localStorage authToken:', localStorage.getItem('authToken'));

  const saveSession = useCallback(
    (user: User) => {
      console.log('🔍 saveSession - Saving user data:', user);
      localStorage.setItem(authSessionKey, JSON.stringify(user))
      console.log('🔍 saveSession - User data saved to localStorage');
      console.log('🔍 saveSession - localStorage content:', localStorage.getItem(authSessionKey));
      setUser(user)
    },
    [setUser],
  )

  const removeSession = useCallback(() => {
    localStorage.removeItem(authSessionKey)
    setUser(undefined)
  }, [setUser])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <>
      {loading ? (
        <PreloaderFull />
      ) : (
        <Suspense fallback={<Preloader />}>
          <AuthContext.Provider
            value={{
              user,
              isAuthenticated: Boolean(user),
              saveSession,
              removeSession,
            }}
          >
            {children}
          </AuthContext.Provider>
        </Suspense>
      )}
    </>
  )
}

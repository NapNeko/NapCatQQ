import { useLocalStorage } from '@uidotdev/usehooks'

const useAuth = () => {
  const [token, setToken] = useLocalStorage<string>('token', '')

  return {
    token,
    isAuth: !!token,
    revokeAuth: () => setToken('')
  }
}

export default useAuth

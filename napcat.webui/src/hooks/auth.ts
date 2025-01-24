import { useLocalStorage } from '@uidotdev/usehooks'

import key from '@/const/key'

const useAuth = () => {
  const [token, setToken] = useLocalStorage<string>(key.token, '')

  return {
    token,
    isAuth: !!token,
    revokeAuth: () => setToken('')
  }
}

export default useAuth

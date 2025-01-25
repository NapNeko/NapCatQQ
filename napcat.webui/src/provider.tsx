import { HeroUIProvider } from '@heroui/system'
import { useNavigate } from 'react-router-dom'

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return <HeroUIProvider navigate={navigate}>{children}</HeroUIProvider>
}

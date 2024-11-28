import XTerm from '@/components/xterm'
import { useTheme } from '@/hooks/use-theme'

export default function LogsPage() {
  const { theme } = useTheme()
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-w-full mx-5 w-[600px]">
        <XTerm theme={theme} className="w-full" />
      </div>
    </section>
  )
}

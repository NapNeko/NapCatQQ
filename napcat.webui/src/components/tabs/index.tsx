import clsx from 'clsx'
import { type ReactNode, createContext, forwardRef, useContext } from 'react'

interface TabsContextValue {
  activeKey: string
  onChange: (key: string) => void
}

const TabsContext = createContext<TabsContextValue>({
  activeKey: '',
  onChange: () => {}
})

interface TabsProps {
  activeKey: string
  onChange: (key: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ activeKey, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeKey, onChange }}>
      <div className={clsx('flex flex-col gap-2', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabListProps {
  children: ReactNode
  className?: string
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={clsx('flex items-center gap-1', className)}>{children}</div>
  )
}

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  className?: string
  children: ReactNode
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ value, className, children, ...props }, ref) => {
    const { activeKey, onChange } = useContext(TabsContext)

    return (
      <button
        ref={ref}
        onClick={() => onChange(value)}
        className={clsx(
          'px-4 py-2 rounded-t transition-colors',
          activeKey === value
            ? 'bg-primary text-white'
            : 'hover:bg-default-100',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Tab.displayName = 'Tab'

interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeKey } = useContext(TabsContext)

  if (value !== activeKey) return null

  return <div className={clsx('flex-1', className)}>{children}</div>
}

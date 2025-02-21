import clsx from 'clsx'
import { type ReactNode, createContext, forwardRef, useContext } from 'react'

export interface TabsContextValue {
  activeKey: string
  onChange: (key: string) => void
}

const TabsContext = createContext<TabsContextValue>({
  activeKey: '',
  onChange: () => {}
})

export interface TabsProps {
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

export interface TabListProps {
  children: ReactNode
  className?: string
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={clsx('flex items-center gap-1', className)}>{children}</div>
  )
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  value: string
  className?: string
  children: ReactNode
  isSelected?: boolean
}

export const Tab = forwardRef<HTMLDivElement, TabProps>(
  ({ className, isSelected, value, ...props }, ref) => {
    const { onChange } = useContext(TabsContext)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onChange(value)
      props.onClick?.(e)
    }

    return (
      <div
        ref={ref}
        role="tab"
        aria-selected={isSelected}
        onClick={handleClick}
        className={clsx(
          'px-2 py-1 flex items-center gap-1 text-sm font-medium border-b-2 transition-colors',
          isSelected
            ? 'border-primary text-primary'
            : 'border-transparent hover:border-default',
          className
        )}
        {...props}
      />
    )
  }
)

Tab.displayName = 'Tab'

export interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeKey } = useContext(TabsContext)

  if (value !== activeKey) return null

  return <div className={clsx('flex-1', className)}>{children}</div>
}

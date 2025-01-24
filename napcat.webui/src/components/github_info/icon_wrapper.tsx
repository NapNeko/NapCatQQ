import clsx from 'clsx'

export interface IconWrapperProps {
  children?: React.ReactNode
  className?: string
}

const IconWrapper = ({ children, className }: IconWrapperProps) => (
  <div
    className={clsx(
      className,
      'flex items-center rounded-small justify-center w-7 h-7'
    )}
  >
    {children}
  </div>
)

export default IconWrapper

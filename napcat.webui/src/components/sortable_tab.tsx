import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { useRef } from 'react'

import { Tab } from './tabs'

interface SortableTabProps {
  id: string
  value: string
  children: React.ReactNode
  className?: string
}

export function SortableTab({
  id,
  value,
  children,
  className
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const mouseDownTime = useRef<number>(0)
  const mouseDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownTime.current = Date.now()
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const timeDiff = Date.now() - mouseDownTime.current
    const distanceX = Math.abs(e.clientX - mouseDownPos.current.x)
    const distanceY = Math.abs(e.clientY - mouseDownPos.current.y)

    // 如果时间小于200ms且移动距离小于5px，认为是点击而不是拖拽
    if (timeDiff < 200 && distanceX < 5 && distanceY < 5) {
      listeners?.onClick?.(e)
    }
  }

  return (
    <Tab
      ref={setNodeRef}
      style={style}
      value={value}
      {...attributes}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={clsx(
        'cursor-move select-none border-b-2 transition-colors',
        isDragging
          ? 'bg-default-100 border-primary'
          : 'hover:bg-default-100 border-transparent',
        className
      )}
    >
      {children}
    </Tab>
  )
}

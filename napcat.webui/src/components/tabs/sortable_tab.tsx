import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Tab } from '@/components/tabs'
import type { TabProps } from '@/components/tabs'

interface SortableTabProps extends TabProps {
  id: string
}

export function SortableTab({ id, ...props }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
    touchAction: 'none'
  }

  return (
    <Tab
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    />
  )
}

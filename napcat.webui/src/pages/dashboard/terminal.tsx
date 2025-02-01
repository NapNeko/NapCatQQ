import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import { Button } from '@heroui/button'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IoAdd, IoClose } from 'react-icons/io5'

import { SortableTab } from '@/components/sortable_tab'
import { TabList, TabPanel, Tabs } from '@/components/tabs'
import { TerminalInstance } from '@/components/terminal/terminal-instance'

import WebUIManager from '@/controllers/webui_manager'

interface TerminalTab {
  id: string
  title: string
}

export default function TerminalPage() {
  const [tabs, setTabs] = useState<TerminalTab[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('')

  useEffect(() => {
    // 获取已存在的终端列表
    WebUIManager.getTerminalList().then((terminals) => {
      if (terminals.length === 0) return

      const newTabs = terminals.map((terminal, index) => ({
        id: terminal.id,
        title: `Terminal ${index + 1}`
      }))

      setTabs(newTabs)
      setSelectedTab(newTabs[0].id)
    })
  }, [])

  const createNewTerminal = async () => {
    try {
      const { id } = await WebUIManager.createTerminal(80, 24)
      const newTab = {
        id,
        title: `Terminal ${tabs.length + 1}`
      }

      setTabs((prev) => [...prev, newTab])
      setSelectedTab(id)
    } catch (error) {
      console.error('Failed to create terminal:', error)
      toast.error('创建终端失败')
    }
  }

  const closeTerminal = async (id: string) => {
    try {
      await WebUIManager.closeTerminal(id)
      setTabs((prev) => prev.filter((tab) => tab.id !== id))
      if (selectedTab === id) {
        setSelectedTab(tabs[0]?.id || '')
      }
    } catch (error) {
      toast.error('关闭终端失败')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="flex flex-col h-full gap-2 p-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Tabs activeKey={selectedTab} onChange={setSelectedTab}>
          <div className="flex items-center gap-2">
            <TabList className="flex-1">
              <SortableContext
                items={tabs}
                strategy={horizontalListSortingStrategy}
              >
                {tabs.map((tab) => (
                  <SortableTab key={tab.id} id={tab.id} value={tab.id}>
                    {tab.title}
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      className="ml-2"
                      onPress={() => closeTerminal(tab.id)}
                    >
                      <IoClose />
                    </Button>
                  </SortableTab>
                ))}
              </SortableContext>
            </TabList>
            <Button
              isIconOnly
              onPress={createNewTerminal}
              startContent={<IoAdd />}
            />
          </div>
          {tabs.map((tab) => (
            <TabPanel key={tab.id} value={tab.id} className="flex-1">
              <TerminalInstance id={tab.id} />
            </TabPanel>
          ))}
        </Tabs>
      </DndContext>
    </div>
  )
}

import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'
import { Spinner } from '@heroui/spinner'
import clsx from 'clsx'
import path from 'path-browserify'
import { useState } from 'react'
import { IoAdd, IoRemove } from 'react-icons/io5'

import FileManager from '@/controllers/file_manager'

interface MoveModalProps {
  isOpen: boolean
  moveTargetPath: string
  selectionInfo: string
  onClose: () => void
  onMove: () => void
  onSelect: (dir: string) => void // 新增回调
}

// 将 DirectoryTree 改为递归组件
// 新增 selectedPath 属性，用于标识当前选中的目录
function DirectoryTree({
  basePath,
  onSelect,
  selectedPath
}: {
  basePath: string
  onSelect: (dir: string) => void
  selectedPath?: string
}) {
  const [dirs, setDirs] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  // 新增loading状态
  const [loading, setLoading] = useState(false)

  const fetchDirectories = async () => {
    try {
      // 直接使用 basePath 调用接口，移除 process.platform 判断
      const list = await FileManager.listDirectories(basePath)
      setDirs(list.map((item) => item.name))
    } catch (error) {
      // ...error handling...
    }
  }

  const handleToggle = async () => {
    if (!expanded) {
      setExpanded(true)
      setLoading(true)
      await fetchDirectories()
      setLoading(false)
    } else {
      setExpanded(false)
    }
  }

  const handleClick = () => {
    onSelect(basePath)
    handleToggle()
  }

  // 计算显示的名称
  const getDisplayName = () => {
    if (basePath === '/') return '/'
    if (/^[A-Z]:$/i.test(basePath)) return basePath
    return path.basename(basePath)
  }

  // 更新 Button 的 variant 逻辑
  const isSeleted = selectedPath === basePath
  const variant = isSeleted
    ? 'solid'
    : selectedPath && path.dirname(selectedPath) === basePath
      ? 'flat'
      : 'light'

  return (
    <div className="ml-4">
      <Button
        onPress={handleClick}
        className="py-1 px-2 text-left justify-start min-w-0 min-h-0 h-auto text-sm rounded-md"
        size="sm"
        color="primary"
        variant={variant}
        startContent={
          <div
            className={clsx(
              'rounded-md',
              isSeleted ? 'bg-primary-600' : 'bg-primary-50'
            )}
          >
            {expanded ? <IoRemove /> : <IoAdd />}
          </div>
        }
      >
        {getDisplayName()}
      </Button>
      {expanded && (
        <div>
          {loading ? (
            <div className="flex py-1 px-8">
              <Spinner size="sm" color="primary" />
            </div>
          ) : (
            dirs.map((dirName) => {
              const childPath =
                basePath === '/' && /^[A-Z]:$/i.test(dirName)
                  ? dirName
                  : path.join(basePath, dirName)
              return (
                <DirectoryTree
                  key={childPath}
                  basePath={childPath}
                  onSelect={onSelect}
                  selectedPath={selectedPath}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function MoveModal({
  isOpen,
  moveTargetPath,
  selectionInfo,
  onClose,
  onMove,
  onSelect
}: MoveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>选择目标目录</ModalHeader>
        <ModalBody>
          <div className="rounded-md p-2 border border-default-300 overflow-auto max-h-60">
            <DirectoryTree
              basePath="/"
              onSelect={onSelect}
              selectedPath={moveTargetPath}
            />
          </div>
          <p className="text-sm text-default-500 mt-2">
            当前选择：{moveTargetPath || '未选择'}
          </p>
          <p className="text-sm text-default-500">移动项：{selectionInfo}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={onMove}>
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs'
import { Button, ButtonGroup } from '@heroui/button'
import { Code } from '@heroui/code'
import { Input } from '@heroui/input'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'
import { Spinner } from '@heroui/spinner'
import {
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/table'
import { Tooltip } from '@heroui/tooltip'
import { Selection } from '@react-types/shared'
import path from 'path-browserify'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiCopy, FiEdit2, FiMove, FiPlus, FiTrash2 } from 'react-icons/fi'
import { TiArrowBack } from 'react-icons/ti'
import { useLocation, useNavigate } from 'react-router-dom'

import CodeEditor from '@/components/code_editor'
import FileIcon from '@/components/file_icon'

import useDialog from '@/hooks/use-dialog'

import FileManager, { FileInfo } from '@/controllers/file_manager'

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  // 修改初始排序状态
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending'
  })
  const dialog = useDialog()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = decodeURIComponent(location.hash.slice(1) || '/')
  const [editingFile, setEditingFile] = useState<{
    path: string
    content: string
  } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [fileType, setFileType] = useState<'file' | 'directory'>('file')
  const [selectedFiles, setSelectedFiles] = useState<Selection>(new Set())
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [renamingFile, setRenamingFile] = useState<string>('')
  const [moveTargetPath, setMoveTargetPath] = useState('')

  const sortFiles = (files: FileInfo[], descriptor: SortDescriptor) => {
    return [...files].sort((a, b) => {
      // 始终保持目录在前面
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1
      }

      const direction = descriptor.direction === 'ascending' ? 1 : -1

      switch (descriptor.column) {
        case 'name':
          return direction * a.name.localeCompare(b.name)
        case 'type': {
          const aType = a.isDirectory ? '目录' : '文件'
          const bType = b.isDirectory ? '目录' : '文件'
          return direction * aType.localeCompare(bType)
        }
        case 'size':
          return direction * ((a.size || 0) - (b.size || 0))
        case 'mtime':
          return (
            direction *
            (new Date(a.mtime).getTime() - new Date(b.mtime).getTime())
          )
        default:
          return 0
      }
    })
  }

  const loadFiles = async () => {
    setLoading(true)
    try {
      const files = await FileManager.listFiles(currentPath)
      setFiles(sortFiles(files, sortDescriptor))
    } catch (error) {
      toast.error('加载文件列表失败')
      setFiles([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFiles()
  }, [currentPath])

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
    setFiles((prev) => sortFiles(prev, descriptor))
  }

  const handleDirectoryClick = (dirPath: string) => {
    // Windows 系统下处理盘符切换
    if (dirPath.match(/^[A-Z]:\\?$/i)) {
      navigate(`/file_manager#${encodeURIComponent(dirPath)}`)
      return
    }

    // 处理返回上级目录
    if (dirPath === '..') {
      // 检查是否在盘符根目录（如 C:）
      if (/^[A-Z]:$/i.test(currentPath)) {
        navigate('/file_manager#/')
        return
      }

      const parentPath = path.dirname(currentPath)
      // 如果已经在根目录，则显示盘符列表（Windows）或保持在根目录（其他系统）
      if (parentPath === currentPath) {
        navigate('/file_manager#/')
        return
      }
      navigate(`/file_manager#${encodeURIComponent(parentPath)}`)
      return
    }

    const newPath = path.join(currentPath, dirPath)
    navigate(`/file_manager#${encodeURIComponent(newPath)}`)
  }

  const handleEdit = async (filePath: string) => {
    try {
      const content = await FileManager.readFile(filePath)
      setEditingFile({ path: filePath, content })
    } catch (error) {
      toast.error('打开文件失败')
    }
  }

  const handleSave = async () => {
    if (!editingFile) return
    try {
      await FileManager.writeFile(editingFile.path, editingFile.content)
      toast.success('保存成功')
      setEditingFile(null)
      loadFiles()
    } catch (error) {
      toast.error('保存失败')
    }
  }

  const handleDelete = async (filePath: string) => {
    dialog.confirm({
      title: '删除文件',
      content: (
        <div>
          确定要删除文件 <Code>{filePath}</Code> 吗？
        </div>
      ),
      onConfirm: async () => {
        try {
          await FileManager.delete(filePath)
          toast.success('删除成功')
          loadFiles()
        } catch (error) {
          toast.error('删除失败')
        }
      }
    })
  }

  const handleCreate = async () => {
    if (!newFileName) return
    const newPath = path.join(currentPath, newFileName)
    try {
      if (fileType === 'directory') {
        const result = await FileManager.createDirectory(newPath)
        if (!result) {
          toast.error('目录已存在')
          return
        }
      } else {
        const result = await FileManager.createFile(newPath)
        if (!result) {
          toast.error('文件已存在')
          return
        }
      }
      toast.success('创建成功')
      setIsCreateModalOpen(false)
      setNewFileName('')
      loadFiles()
    } catch (error) {
      const err = error as Error
      toast.error(err?.message || '创建失败')
    }
  }

  const handleBatchDelete = async () => {
    // 处理 Selection 类型
    const selectedArray =
      selectedFiles === 'all'
        ? files.map((f) => f.name)
        : Array.from(selectedFiles as Set<string>)

    if (selectedArray.length === 0) return

    dialog.confirm({
      title: '批量删除',
      content: <div>确定要删除选中的 {selectedArray.length} 个项目吗？</div>,
      onConfirm: async () => {
        try {
          const paths = selectedArray.map((key) => path.join(currentPath, key))
          await FileManager.batchDelete(paths)
          toast.success('批量删除成功')
          setSelectedFiles(new Set())
          loadFiles()
        } catch (error) {
          toast.error('批量删除失败')
        }
      }
    })
  }

  // 处理重命名
  const handleRename = async () => {
    if (!renamingFile || !newFileName) return
    try {
      const oldPath = path.join(currentPath, renamingFile)
      const newPath = path.join(currentPath, newFileName)
      await FileManager.rename(oldPath, newPath)
      toast.success('重命名成功')
      setIsRenameModalOpen(false)
      setRenamingFile('')
      setNewFileName('')
      loadFiles()
    } catch (error) {
      toast.error('重命名失败')
    }
  }

  // 处理移动
  const handleMove = async (sourceName: string) => {
    if (!moveTargetPath) return
    try {
      const sourcePath = path.join(currentPath, sourceName)
      const targetPath = path.join(moveTargetPath, sourceName)
      await FileManager.move(sourcePath, targetPath)
      toast.success('移动成功')
      setIsMoveModalOpen(false)
      setMoveTargetPath('')
      loadFiles()
    } catch (error) {
      toast.error('移动失败')
    }
  }

  // 处理批量移动
  const handleBatchMove = async () => {
    if (!moveTargetPath) return
    const selectedArray =
      selectedFiles === 'all'
        ? files.map((f) => f.name)
        : Array.from(selectedFiles as Set<string>)

    if (selectedArray.length === 0) return

    try {
      const items = selectedArray.map((name) => ({
        sourcePath: path.join(currentPath, name),
        targetPath: path.join(moveTargetPath, name)
      }))
      await FileManager.batchMove(items)
      toast.success('批量移动成功')
      setIsMoveModalOpen(false)
      setMoveTargetPath('')
      setSelectedFiles(new Set())
      loadFiles()
    } catch (error) {
      toast.error('批量移动失败')
    }
  }

  // 添加复制路径处理函数
  const handleCopyPath = (fileName: string) => {
    const fullPath = path.join(currentPath, fileName)
    navigator.clipboard.writeText(fullPath)
    toast.success('路径已复制')
  }

  // 修改移动按钮的点击处理
  const handleMoveClick = (fileName: string) => {
    setRenamingFile(fileName)
    setMoveTargetPath('')
    setIsMoveModalOpen(true)
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <Button
          color="danger"
          size="sm"
          isIconOnly
          variant="flat"
          onPress={() => handleDirectoryClick('..')}
          className="text-lg"
          radius="full"
        >
          <TiArrowBack />
        </Button>
        <Button
          color="danger"
          size="sm"
          isIconOnly
          variant="flat"
          onPress={() => setIsCreateModalOpen(true)}
          className="text-lg"
          radius="full"
        >
          <FiPlus />
        </Button>
        {(selectedFiles === 'all' ||
          (selectedFiles as Set<string>).size > 0) && (
          <>
            <Button
              color="danger"
              size="sm"
              variant="flat"
              onPress={handleBatchDelete}
              startContent={<FiTrash2 />}
            >
              删除选中项 (
              {selectedFiles === 'all'
                ? files.length
                : (selectedFiles as Set<string>).size}
              )
            </Button>
            <Button
              color="danger"
              size="sm"
              variant="flat"
              onPress={() => {
                setMoveTargetPath('')
                setIsMoveModalOpen(true)
              }}
              startContent={<FiMove />}
            >
              移动选中项
            </Button>
          </>
        )}
        <Breadcrumbs>
          {currentPath.split('/').map((part, index, parts) => (
            <BreadcrumbItem
              key={part}
              isCurrent={index === parts.length - 1}
              onPress={() => {
                const newPath = parts.slice(0, index + 1).join('/')
                navigate(`/file_manager#${encodeURIComponent(newPath)}`)
              }}
            >
              {part}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>

      <Table
        aria-label="文件列表"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        onSelectionChange={setSelectedFiles}
        defaultSelectedKeys={[]}
        selectedKeys={selectedFiles}
        selectionMode="multiple"
      >
        <TableHeader>
          <TableColumn key="name" allowsSorting>
            名称
          </TableColumn>
          <TableColumn key="type" allowsSorting>
            类型
          </TableColumn>
          <TableColumn key="size" allowsSorting>
            大小
          </TableColumn>
          <TableColumn key="mtime" allowsSorting>
            修改时间
          </TableColumn>
          <TableColumn key="actions">操作</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent={
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          }
          items={files}
        >
          {(file) => (
            <TableRow key={file.name}>
              <TableCell>
                <Button
                  variant="light"
                  onPress={() => {
                    if (file.isDirectory) {
                      handleDirectoryClick(file.name)
                    } else {
                      handleEdit(path.join(currentPath, file.name))
                    }
                  }}
                  className="text-left justify-start"
                  startContent={
                    <FileIcon name={file.name} isDirectory={file.isDirectory} />
                  }
                >
                  {file.name}
                </Button>
              </TableCell>
              <TableCell>{file.isDirectory ? '目录' : '文件'}</TableCell>
              <TableCell>
                {isNaN(file.size) || file.isDirectory
                  ? '-'
                  : `${file.size} 字节`}
              </TableCell>
              <TableCell>{new Date(file.mtime).toLocaleString()}</TableCell>
              <TableCell>
                <ButtonGroup size="sm">
                  <Tooltip content="重命名">
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        setRenamingFile(file.name)
                        setNewFileName(file.name)
                        setIsRenameModalOpen(true)
                      }}
                    >
                      <FiEdit2 />
                    </Button>
                  </Tooltip>
                  <Tooltip content="移动">
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => handleMoveClick(file.name)}
                    >
                      <FiMove />
                    </Button>
                  </Tooltip>
                  <Tooltip content="复制路径">
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => handleCopyPath(file.name)}
                    >
                      <FiCopy />
                    </Button>
                  </Tooltip>
                  <Tooltip content="删除">
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() =>
                        handleDelete(path.join(currentPath, file.name))
                      }
                    >
                      <FiTrash2 />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 文件编辑对话框 */}
      <Modal
        size="full"
        isOpen={!!editingFile}
        onClose={() => setEditingFile(null)}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 bg-content2 bg-opacity-50">
            <span>编辑文件</span>
            <Code className="text-xs">{editingFile?.path}</Code>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="h-full">
              <CodeEditor
                height="100%"
                value={editingFile?.content}
                onChange={(value) =>
                  setEditingFile((prev) =>
                    prev ? { ...prev, content: value || '' } : null
                  )
                }
                options={{ wordWrap: 'on' }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => setEditingFile(null)}
            >
              取消
            </Button>
            <Button color="danger" onPress={handleSave}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 新建文件/目录对话框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>新建</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <ButtonGroup color="danger">
                <Button
                  variant={fileType === 'file' ? 'solid' : 'flat'}
                  onPress={() => setFileType('file')}
                >
                  文件
                </Button>
                <Button
                  variant={fileType === 'directory' ? 'solid' : 'flat'}
                  onPress={() => setFileType('directory')}
                >
                  目录
                </Button>
              </ButtonGroup>
              <Input
                label="名称"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button color="danger" onPress={handleCreate}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 重命名对话框 */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>重命名</ModalHeader>
          <ModalBody>
            <Input
              label="新名称"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => setIsRenameModalOpen(false)}
            >
              取消
            </Button>
            <Button color="danger" onPress={handleRename}>
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 移动对话框 */}
      <Modal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)}>
        <ModalContent>
          <ModalHeader>移动到</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="目标路径"
                value={moveTargetPath}
                onChange={(e) => setMoveTargetPath(e.target.value)}
                placeholder="请输入完整目标路径"
              />
              <p className="text-sm text-gray-500">
                当前选择：
                {selectedFiles === 'all' ||
                (selectedFiles as Set<string>).size > 0
                  ? `${selectedFiles === 'all' ? files.length : (selectedFiles as Set<string>).size} 个项目`
                  : renamingFile}
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => setIsMoveModalOpen(false)}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={() =>
                selectedFiles === 'all' ||
                (selectedFiles as Set<string>).size > 0
                  ? handleBatchMove()
                  : handleMove(renamingFile)
              }
            >
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

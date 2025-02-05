import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import type { Selection, SortDescriptor } from '@react-types/shared'
import clsx from 'clsx'
import { motion } from 'motion/react'
import path from 'path-browserify'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { FiDownload, FiMove, FiPlus, FiUpload } from 'react-icons/fi'
import { MdRefresh } from 'react-icons/md'
import { TbTrash } from 'react-icons/tb'
import { TiArrowBack } from 'react-icons/ti'
import { useLocation, useNavigate } from 'react-router-dom'

import CreateFileModal from '@/components/file_manage/create_file_modal'
import FileEditModal from '@/components/file_manage/file_edit_modal'
import FilePreviewModal from '@/components/file_manage/file_preview_modal'
import FileTable from '@/components/file_manage/file_table'
import MoveModal from '@/components/file_manage/move_modal'
import RenameModal from '@/components/file_manage/rename_modal'

import useDialog from '@/hooks/use-dialog'

import FileManager, { FileInfo } from '@/controllers/file_manager'

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending'
  })
  const dialog = useDialog()
  const location = useLocation()
  const navigate = useNavigate()
  // 修改 currentPath 初始化逻辑，去掉可能的前导斜杠
  let currentPath = decodeURIComponent(location.hash.slice(1) || '/')
  if (/^\/[A-Z]:$/i.test(currentPath)) {
    currentPath = currentPath.slice(1)
  }
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
  const [jumpPath, setJumpPath] = useState('')
  const [previewFile, setPreviewFile] = useState<string>('')
  const [showUpload, setShowUpload] = useState<boolean>(false)

  const sortFiles = (files: FileInfo[], descriptor: typeof sortDescriptor) => {
    return [...files].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
      const direction = descriptor.direction === 'ascending' ? 1 : -1
      switch (descriptor.column) {
        case 'name':
          return direction * a.name.localeCompare(b.name)
        case 'type': {
          const aType = a.isDirectory ? '目录' : '文件'
          const bType = a.isDirectory ? '目录' : '文件'
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
      const fileList = await FileManager.listFiles(currentPath)
      setFiles(sortFiles(fileList, sortDescriptor))
    } catch (error) {
      toast.error('加载文件列表失败')
      setFiles([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFiles()
  }, [currentPath])

  const handleSortChange = (descriptor: typeof sortDescriptor) => {
    setSortDescriptor(descriptor)
    setFiles((prev) => sortFiles(prev, descriptor))
  }

  const handleDirectoryClick = (dirPath: string) => {
    if (dirPath === '..') {
      if (/^[A-Z]:$/i.test(currentPath)) {
        navigate('/file_manager#/')
        return
      }
      const parentPath = path.dirname(currentPath)
      navigate(
        `/file_manager#${encodeURIComponent(parentPath === currentPath ? '/' : parentPath)}`
      )
      return
    }
    navigate(
      `/file_manager#${encodeURIComponent(path.join(currentPath, dirPath))}`
    )
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
      content: <div>确定要删除文件 {filePath} 吗？</div>,
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
        if (!(await FileManager.createDirectory(newPath))) {
          toast.error('目录已存在')
          return
        }
      } else {
        if (!(await FileManager.createFile(newPath))) {
          toast.error('文件已存在')
          return
        }
      }
      toast.success('创建成功')
      setIsCreateModalOpen(false)
      setNewFileName('')
      loadFiles()
    } catch (error) {
      toast.error((error as Error)?.message || '创建失败')
    }
  }

  const handleBatchDelete = async () => {
    const selectedArray =
      selectedFiles instanceof Set
        ? Array.from(selectedFiles)
        : files.map((f) => f.name)
    if (selectedArray.length === 0) return
    dialog.confirm({
      title: '批量删除',
      content: <div>确定要删除选中的 {selectedArray.length} 个项目吗？</div>,
      onConfirm: async () => {
        try {
          const paths = selectedArray.map((key) =>
            path.join(currentPath, key.toString())
          )
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

  const handleRename = async () => {
    if (!renamingFile || !newFileName) return
    try {
      await FileManager.rename(
        path.join(currentPath, renamingFile),
        path.join(currentPath, newFileName)
      )
      toast.success('重命名成功')
      setIsRenameModalOpen(false)
      setRenamingFile('')
      setNewFileName('')
      loadFiles()
    } catch (error) {
      toast.error('重命名失败')
    }
  }

  const handleMove = async (sourceName: string) => {
    if (!moveTargetPath) return
    try {
      await FileManager.move(
        path.join(currentPath, sourceName),
        path.join(moveTargetPath, sourceName)
      )
      toast.success('移动成功')
      setIsMoveModalOpen(false)
      setMoveTargetPath('')
      loadFiles()
    } catch (error) {
      toast.error('移动失败')
    }
  }

  const handleBatchMove = async () => {
    if (!moveTargetPath) return
    const selectedArray =
      selectedFiles instanceof Set
        ? Array.from(selectedFiles)
        : files.map((f) => f.name)
    if (selectedArray.length === 0) return
    try {
      const items = selectedArray.map((name) => ({
        sourcePath: path.join(currentPath, name.toString()),
        targetPath: path.join(moveTargetPath, name.toString())
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

  const handleCopyPath = (fileName: string) => {
    navigator.clipboard.writeText(path.join(currentPath, fileName))
    toast.success('路径已复制')
  }

  const handleMoveClick = (fileName: string) => {
    setRenamingFile(fileName)
    setMoveTargetPath('')
    setIsMoveModalOpen(true)
  }

  const handleDownload = (filePath: string) => {
    FileManager.download(filePath)
  }

  const handleBatchDownload = async () => {
    const selectedArray =
      selectedFiles instanceof Set
        ? Array.from(selectedFiles)
        : files.map((f) => f.name)
    if (selectedArray.length === 0) return
    const paths = selectedArray.map((key) =>
      path.join(currentPath, key.toString())
    )
    await FileManager.batchDownload(paths)
  }

  const handlePreview = (filePath: string) => {
    setPreviewFile(filePath)
  }

  const onDrop = async (acceptedFiles: File[]) => {
    try {
      // 遍历处理文件，保持文件夹结构
      const processedFiles = acceptedFiles.map((file) => {
        const relativePath = file.webkitRelativePath || file.name
        // 不需要额外的编码处理，浏览器会自动处理
        return new File([file], relativePath, {
          type: file.type,
          lastModified: file.lastModified
        })
      })

      toast
        .promise(FileManager.upload(currentPath, processedFiles), {
          loading: '正在上传文件...',
          success: '上传成功',
          error: '上传失败'
        })
        .then(() => {
          loadFiles()
        })
    } catch (error) {
      toast.error('上传失败')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    onDragOver: (e) => {
      e.preventDefault()
      e.stopPropagation()
    },
    useFsAccessApi: false // 添加此选项以避免某些浏览器的文件系统API问题
  })

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4 sticky top-14 z-10 bg-content1 py-1">
        <Button
          color="primary"
          size="sm"
          isIconOnly
          variant="flat"
          onPress={() => handleDirectoryClick('..')}
          className="text-lg"
        >
          <TiArrowBack />
        </Button>

        <Button
          color="primary"
          size="sm"
          isIconOnly
          variant="flat"
          onPress={() => setIsCreateModalOpen(true)}
          className="text-lg"
        >
          <FiPlus />
        </Button>

        <Button
          color="primary"
          isLoading={loading}
          size="sm"
          isIconOnly
          variant="flat"
          onPress={loadFiles}
          className="text-lg"
        >
          <MdRefresh />
        </Button>
        <Button
          color="primary"
          size="sm"
          isIconOnly
          variant="flat"
          onPress={() => setShowUpload((prev) => !prev)}
          className="text-lg"
        >
          <FiUpload />
        </Button>

        {((selectedFiles instanceof Set && selectedFiles.size > 0) ||
          selectedFiles === 'all') && (
          <>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={handleBatchDelete}
              className="text-sm"
              startContent={<TbTrash className="text-lg" />}
            >
              (
              {selectedFiles instanceof Set ? selectedFiles.size : files.length}
              )
            </Button>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={() => {
                setMoveTargetPath('')
                setIsMoveModalOpen(true)
              }}
              className="text-sm"
              startContent={<FiMove className="text-lg" />}
            >
              (
              {selectedFiles instanceof Set ? selectedFiles.size : files.length}
              )
            </Button>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={handleBatchDownload}
              className="text-sm"
              startContent={<FiDownload className="text-lg" />}
            >
              (
              {selectedFiles instanceof Set ? selectedFiles.size : files.length}
              )
            </Button>
          </>
        )}
        <Breadcrumbs className="flex-1 shadow-small px-2 py-2 rounded-lg">
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
        <Input
          type="text"
          placeholder="输入跳转路径"
          value={jumpPath}
          onChange={(e) => setJumpPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && jumpPath.trim() !== '') {
              navigate(`/file_manager#${encodeURIComponent(jumpPath.trim())}`)
            }
          }}
          className="ml-auto w-64"
        />
      </div>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: showUpload ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'border-dashed rounded-lg text-center',
          isDragActive ? 'border-primary bg-primary/10' : 'border-default-300',
          showUpload ? 'mb-4 border-2' : 'border-none'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div {...getRootProps()} className="w-full h-full p-4">
          <input {...getInputProps()} multiple />
          <p>拖拽文件或文件夹到此处上传，或点击选择文件</p>
        </div>
      </motion.div>

      <FileTable
        files={files}
        currentPath={currentPath}
        loading={loading}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        selectedFiles={selectedFiles}
        onSelectionChange={setSelectedFiles}
        onDirectoryClick={handleDirectoryClick}
        onEdit={handleEdit}
        onPreview={handlePreview}
        onRenameRequest={(name) => {
          setRenamingFile(name)
          setNewFileName(name)
          setIsRenameModalOpen(true)
        }}
        onMoveRequest={handleMoveClick}
        onCopyPath={handleCopyPath}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      <FileEditModal
        isOpen={!!editingFile}
        file={editingFile}
        onClose={() => setEditingFile(null)}
        onSave={handleSave}
        onContentChange={(newContent) =>
          setEditingFile((prev) =>
            prev ? { ...prev, content: newContent ?? '' } : null
          )
        }
      />

      <FilePreviewModal
        isOpen={!!previewFile}
        filePath={previewFile}
        onClose={() => setPreviewFile('')}
      />

      <CreateFileModal
        isOpen={isCreateModalOpen}
        fileType={fileType}
        newFileName={newFileName}
        onTypeChange={setFileType}
        onNameChange={(e) => setNewFileName(e.target.value)}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        newFileName={newFileName}
        onNameChange={(e) => setNewFileName(e.target.value)}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRename}
      />

      <MoveModal
        isOpen={isMoveModalOpen}
        moveTargetPath={moveTargetPath}
        selectionInfo={
          selectedFiles instanceof Set && selectedFiles.size > 0
            ? `${selectedFiles.size} 个项目`
            : renamingFile
        }
        onClose={() => setIsMoveModalOpen(false)}
        onMove={() =>
          selectedFiles instanceof Set && selectedFiles.size > 0
            ? handleBatchMove()
            : handleMove(renamingFile)
        }
        onSelect={(dir) => setMoveTargetPath(dir)} // 替换原有 onTargetChange
      />
    </div>
  )
}

import { Button, ButtonGroup } from '@heroui/button'
import { Pagination } from '@heroui/pagination'
import { Spinner } from '@heroui/spinner'
import {
  type Selection,
  type SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/table'
import path from 'path-browserify'
import { useState } from 'react'
import { BiRename } from 'react-icons/bi'
import { FiCopy, FiDownload, FiMove, FiTrash2 } from 'react-icons/fi'

import FileIcon from '@/components/file_icon'

import type { FileInfo } from '@/controllers/file_manager'

interface FileTableProps {
  files: FileInfo[]
  currentPath: string
  loading: boolean
  sortDescriptor: SortDescriptor
  onSortChange: (descriptor: SortDescriptor) => void
  selectedFiles: Selection
  onSelectionChange: (selected: Selection) => void
  onDirectoryClick: (dirPath: string) => void
  onEdit: (filePath: string) => void
  onPreview: (filePath: string) => void
  onRenameRequest: (name: string) => void
  onMoveRequest: (name: string) => void
  onCopyPath: (fileName: string) => void
  onDelete: (filePath: string) => void
  onDownload: (filePath: string) => void
}

const PAGE_SIZE = 20

export default function FileTable({
  files,
  currentPath,
  loading,
  sortDescriptor,
  onSortChange,
  selectedFiles,
  onSelectionChange,
  onDirectoryClick,
  onEdit,
  onPreview,
  onRenameRequest,
  onMoveRequest,
  onCopyPath,
  onDelete,
  onDownload
}: FileTableProps) {
  const [page, setPage] = useState(1)
  const pages = Math.ceil(files.length / PAGE_SIZE) || 1
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const displayFiles = files.slice(start, end)
  return (
    <Table
      aria-label="文件列表"
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      onSelectionChange={onSelectionChange}
      defaultSelectedKeys={[]}
      selectedKeys={selectedFiles}
      selectionMode="multiple"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="danger"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
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
        items={displayFiles}
      >
        {(file: FileInfo) => {
          const filePath = path.join(currentPath, file.name)
          // 判断预览类型
          const ext = path.extname(file.name).toLowerCase()
          const previewable = [
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.bmp',
            '.mp4',
            '.webm',
            '.mp3',
            '.wav'
          ].includes(ext)
          return (
            <TableRow key={file.name}>
              <TableCell>
                <Button
                  variant="light"
                  onPress={() =>
                    file.isDirectory
                      ? onDirectoryClick(file.name)
                      : previewable
                        ? onPreview(filePath)
                        : onEdit(filePath)
                  }
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
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onRenameRequest(file.name)}
                  >
                    <BiRename />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onMoveRequest(file.name)}
                  >
                    <FiMove />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onCopyPath(file.name)}
                  >
                    <FiCopy />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onDownload(filePath)}
                  >
                    <FiDownload />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onDelete(filePath)}
                  >
                    <FiTrash2 />
                  </Button>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          )
        }}
      </TableBody>
    </Table>
  )
}

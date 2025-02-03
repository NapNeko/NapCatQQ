import { Button, ButtonGroup } from '@heroui/button'
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
import { Tooltip } from '@heroui/tooltip'
import path from 'path-browserify'
import { BiRename } from 'react-icons/bi'
import { FiCopy, FiMove, FiTrash2 } from 'react-icons/fi'

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
  onRenameRequest: (name: string) => void
  onMoveRequest: (name: string) => void
  onCopyPath: (fileName: string) => void
  onDelete: (filePath: string) => void
}

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
  onRenameRequest,
  onMoveRequest,
  onCopyPath,
  onDelete
}: FileTableProps) {
  return (
    <Table
      aria-label="文件列表"
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      onSelectionChange={onSelectionChange}
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
        {(file: FileInfo) => (
          <TableRow key={file.name}>
            <TableCell>
              <Button
                variant="light"
                onPress={() =>
                  file.isDirectory
                    ? onDirectoryClick(file.name)
                    : onEdit(path.join(currentPath, file.name))
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
              {isNaN(file.size) || file.isDirectory ? '-' : `${file.size} 字节`}
            </TableCell>
            <TableCell>{new Date(file.mtime).toLocaleString()}</TableCell>
            <TableCell>
              <ButtonGroup size="sm">
                <Tooltip content="重命名">
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onRenameRequest(file.name)}
                  >
                    <BiRename />
                  </Button>
                </Tooltip>
                <Tooltip content="移动">
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onMoveRequest(file.name)}
                  >
                    <FiMove />
                  </Button>
                </Tooltip>
                <Tooltip content="复制路径">
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onCopyPath(file.name)}
                  >
                    <FiCopy />
                  </Button>
                </Tooltip>
                <Tooltip content="删除">
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onDelete(path.join(currentPath, file.name))}
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
  )
}

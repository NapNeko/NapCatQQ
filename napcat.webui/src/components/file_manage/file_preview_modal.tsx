import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'
import { Spinner } from '@heroui/spinner'
import { useRequest } from 'ahooks'
import path from 'path-browserify'

import FileManager from '@/controllers/file_manager'

interface FilePreviewModalProps {
  isOpen: boolean
  filePath: string
  onClose: () => void
}

const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
const videoExts = ['.mp4', '.webm']
const audioExts = ['.mp3', '.wav']

const supportedPreviewExts = [...imageExts, ...videoExts, ...audioExts]

export default function FilePreviewModal({
  isOpen,
  filePath,
  onClose
}: FilePreviewModalProps) {
  const ext = path.extname(filePath).toLowerCase()
  const { data, loading, error, run } = useRequest(
    async (path: string) => FileManager.downloadToURL(path),
    {
      refreshDeps: [filePath],
      refreshDepsAction: () => {
        const ext = path.extname(filePath).toLowerCase()
        if (!filePath || !supportedPreviewExts.includes(ext)) {
          return
        }
        run(filePath)
      }
    }
  )

  let contentElement = null
  if (!supportedPreviewExts.includes(ext)) {
    contentElement = <div>暂不支持预览此文件类型</div>
  } else if (error) {
    contentElement = <div>读取文件失败</div>
  } else if (loading || !data) {
    contentElement = (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    )
  } else if (imageExts.includes(ext)) {
    contentElement = (
      <img src={data} alt="预览" className="max-w-full max-h-96" />
    )
  } else if (videoExts.includes(ext)) {
    contentElement = (
      <video src={data} controls className="max-w-full max-h-96" />
    )
  } else if (audioExts.includes(ext)) {
    contentElement = <audio src={data} controls className="w-full" />
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>文件预览</ModalHeader>
        <ModalBody className="flex justify-center items-center">
          {contentElement}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="flat" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

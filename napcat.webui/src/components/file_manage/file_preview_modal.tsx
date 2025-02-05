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
import { useEffect } from 'react'

import FileManager from '@/controllers/file_manager'

interface FilePreviewModalProps {
  isOpen: boolean
  filePath: string
  onClose: () => void
}

export const videoExts = ['.mp4', '.webm']
export const audioExts = ['.mp3', '.wav']

export const supportedPreviewExts = [...videoExts, ...audioExts]

export default function FilePreviewModal({
  isOpen,
  filePath,
  onClose
}: FilePreviewModalProps) {
  const ext = path.extname(filePath).toLowerCase()
  const { data, loading, error, run } = useRequest(
    async () => FileManager.downloadToURL(filePath),
    {
      refreshDeps: [filePath],
      manual: true,
      refreshDepsAction: () => {
        const ext = path.extname(filePath).toLowerCase()
        if (!filePath || !supportedPreviewExts.includes(ext)) {
          return
        }
        run()
      }
    }
  )

  useEffect(() => {
    if (filePath) {
      run()
    }
  }, [filePath])

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
  } else if (videoExts.includes(ext)) {
    contentElement = <video src={data} controls className="max-w-full" />
  } else if (audioExts.includes(ext)) {
    contentElement = <audio src={data} controls className="w-full" />
  } else {
    contentElement = (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size="3xl">
      <ModalContent>
        <ModalHeader>文件预览</ModalHeader>
        <ModalBody className="flex justify-center items-center">
          {contentElement}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

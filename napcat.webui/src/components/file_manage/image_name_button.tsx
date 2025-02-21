import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import { Spinner } from '@heroui/spinner'
import { useRequest } from 'ahooks'
import path from 'path-browserify'
import { useEffect } from 'react'

import FileManager from '@/controllers/file_manager'

import FileIcon from '../file_icon'

export interface PreviewImage {
  key: string
  src: string
  alt: string
}
export const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']

export interface ImageNameButtonProps {
  name: string
  filePath: string
  onPreview: () => void
  onAddPreview: (image: PreviewImage) => void
}

export default function ImageNameButton({
  name,
  filePath,
  onPreview,
  onAddPreview
}: ImageNameButtonProps) {
  const { data, loading, error, run } = useRequest(
    async () => FileManager.downloadToURL(filePath),
    {
      refreshDeps: [filePath],
      manual: true,
      refreshDepsAction: () => {
        const ext = path.extname(filePath).toLowerCase()
        if (!filePath || !imageExts.includes(ext)) {
          return
        }
        run()
      }
    }
  )
  useEffect(() => {
    if (data) {
      onAddPreview({
        key: name,
        src: data,
        alt: name
      })
    }
  }, [data, name, onAddPreview])

  useEffect(() => {
    if (filePath) {
      run()
    }
  }, [])

  return (
    <Button
      variant="light"
      className="text-left justify-start"
      onPress={onPreview}
      startContent={
        error ? (
          <FileIcon name={name} isDirectory={false} />
        ) : loading || !data ? (
          <Spinner size="sm" />
        ) : (
          <Image
            src={data}
            alt={name}
            className="w-8 h-8 flex-shrink-0"
            classNames={{
              wrapper: 'w-8 h-8 flex-shrink-0'
            }}
            radius="sm"
          />
        )
      }
    >
      {name}
    </Button>
  )
}

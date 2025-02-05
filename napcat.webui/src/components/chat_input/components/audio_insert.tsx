import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Tooltip } from '@heroui/tooltip'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaMicrophone } from 'react-icons/fa6'
import { IoMic } from 'react-icons/io5'
import { MdEdit, MdUpload } from 'react-icons/md'

import useShowStructuredMessage from '@/hooks/use_show_strcuted_message'

import { isURI } from '@/utils/url'

import type { OB11Segment } from '@/types/onebot'

const AudioInsert = () => {
  const [audioUrl, setAudioUrl] = useState<string>('')
  const audioInputRef = useRef<HTMLInputElement>(null)
  const showStructuredMessage = useShowStructuredMessage()
  const showAudioSegment = (file: string) => {
    const messages: OB11Segment[] = [
      {
        type: 'record',
        data: {
          file: file
        }
      }
    ]
    showStructuredMessage(messages)
  }

  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream
        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder
        recorder.start()
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }
        recorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/wav'
            })
            const reader = new FileReader()
            reader.readAsDataURL(audioBlob)
            reader.onloadend = () => {
              const base64Audio = reader.result as string
              setAudioPreview(base64Audio)
              setShowPreview(true)
            }
            audioChunksRef.current = []
          }
          stream.getTracks().forEach((track) => track.stop())
        }
      })
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      mediaRecorderRef.current?.stop()
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }, [isRecording])

  const startRecording = () => {
    setAudioPreview(null)
    setShowPreview(false)
    setRecordingTime(0)
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const handleShowPreview = () => {
    if (audioPreview) {
      showAudioSegment(audioPreview)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <>
      <Popover>
        <Tooltip content="发送音频">
          <div className="max-w-fit">
            <PopoverTrigger>
              <Button color="primary" variant="flat" isIconOnly radius="full">
                <IoMic className="text-xl" />
              </Button>
            </PopoverTrigger>
          </div>
        </Tooltip>
        <PopoverContent className="flex-row gap-2 p-4">
          <Tooltip content="上传音频">
            <Button
              className="text-lg"
              color="primary"
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => {
                audioInputRef?.current?.click()
              }}
            >
              <MdUpload />
            </Button>
          </Tooltip>
          <Popover>
            <Tooltip content="输入音频地址">
              <div className="max-w-fit">
                <PopoverTrigger tooltip="输入音频地址">
                  <Button
                    className="text-lg"
                    color="primary"
                    isIconOnly
                    variant="flat"
                    radius="full"
                  >
                    <MdEdit />
                  </Button>
                </PopoverTrigger>
              </div>
            </Tooltip>
            <PopoverContent className="flex-row gap-1 p-2">
              <Input
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="请输入音频地址"
              />
              <Button
                color="primary"
                variant="flat"
                isIconOnly
                radius="full"
                onPress={() => {
                  if (!isURI(audioUrl)) {
                    toast.error('请输入正确的音频地址')
                    return
                  }
                  showAudioSegment(audioUrl)
                  setAudioUrl('')
                }}
              >
                <FaMicrophone />
              </Button>
            </PopoverContent>
          </Popover>
          <Popover>
            <Tooltip content="录制音频">
              <div className="max-w-fit">
                <PopoverTrigger>
                  <Button
                    className="text-lg"
                    color="primary"
                    isIconOnly
                    variant="flat"
                    radius="full"
                  >
                    <IoMic />
                  </Button>
                </PopoverTrigger>
              </div>
            </Tooltip>
            <PopoverContent className="flex-col gap-2 p-4">
              <div className="flex gap-2">
                <Button
                  color={isRecording ? 'primary' : 'primary'}
                  variant="flat"
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? '停止录制' : '开始录制'}
                </Button>
                {showPreview && audioPreview && (
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={handleShowPreview}
                  >
                    查看消息
                  </Button>
                )}
              </div>
              {(isRecording || audioPreview) && (
                <div className="flex gap-1 items-center">
                  <span
                    className={clsx(
                      'w-4 h-4 rounded-full',
                      isRecording
                        ? 'animate-pulse bg-primary-400'
                        : 'bg-success-400'
                    )}
                  ></span>
                  <span>录制时长: {formatTime(recordingTime)}</span>
                </div>
              )}
              {showPreview && audioPreview && (
                <audio controls src={audioPreview} />
              )}
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>

      <input
        type="file"
        ref={audioInputRef}
        hidden
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) {
            return
          }
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = (event) => {
            const dataURL = event.target?.result
            showAudioSegment(dataURL as string)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default AudioInsert

import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Image } from '@heroui/image'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Slider } from '@heroui/slider'
import { Tooltip } from '@heroui/tooltip'
import { useLocalStorage } from '@uidotdev/usehooks'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle
} from 'react-icons/bi'
import {
  FaPause,
  FaPlay,
  FaRegHandPointRight,
  FaRepeat,
  FaShuffle
} from 'react-icons/fa6'
import { TbRepeatOnce } from 'react-icons/tb'
import { useMediaQuery } from 'react-responsive'

import { PlayMode } from '@/const/enum'
import key from '@/const/key'

import { VolumeHighIcon, VolumeLowIcon } from './icons'

export interface AudioPlayerProps
  extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string
  title?: string
  artist?: string
  cover?: string
  pressNext?: () => void
  pressPrevious?: () => void
  onPlayEnd?: () => void
  onChangeMode?: (mode: PlayMode) => void
  mode?: PlayMode
}

export default function AudioPlayer(props: AudioPlayerProps) {
  const {
    src,
    pressNext,
    pressPrevious,
    cover = 'https://nextui.org/images/album-cover.png',
    title = '未知',
    artist = '未知',
    onTimeUpdate,
    onLoadedData,
    onPlay,
    onPause,
    onPlayEnd,
    onChangeMode,
    autoPlay,
    mode = PlayMode.Loop,
    ...rest
  } = props

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    key.isCollapsedMusicPlayer,
    false
  )
  const audioRef = useRef<HTMLAudioElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startX = useRef(0)
  const [translateY, setTranslateY] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const isSmallScreen = useMediaQuery({ maxWidth: 767 })
  const isMediumUp = useMediaQuery({ minWidth: 768 })
  const shouldAdd = useRef(false)
  const currentProgress = (currentTime / duration) * 100
  const [storageAutoPlay, setStorageAutoPlay] = useLocalStorage(
    key.autoPlay,
    true
  )

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = event.target as HTMLAudioElement
    setCurrentTime(audio.currentTime)
    onTimeUpdate?.(event)
  }

  const handleLoadedData = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = event.target as HTMLAudioElement
    setDuration(audio.duration)
    onLoadedData?.(event)
  }

  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setIsPlaying(true)
    setStorageAutoPlay(true)
    onPlay?.(e)
  }

  const handlePause = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setIsPlaying(false)
    onPause?.(e)
  }

  const changeMode = () => {
    const modes = [PlayMode.Loop, PlayMode.Random, PlayMode.Single]
    const currentIndex = modes.findIndex((_mode) => _mode === mode)
    const nextIndex = currentIndex + 1
    const nextMode = modes[nextIndex] || modes[0]
    onChangeMode?.(nextMode)
  }

  const volumeChange = (value: number) => {
    setVolume(value)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume / 100
    }
  }, [volume])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current
    const deltaX = e.touches[0].clientX - startX.current
    const container = cardRef.current
    const header = cardRef.current?.querySelector('[data-header]')
    const headerHeight = header?.clientHeight || 20
    const addHeight = (container?.clientHeight || headerHeight) - headerHeight
    const _shouldAdd = isCollapsed && deltaY < 0
    if (isSmallScreen) {
      shouldAdd.current = _shouldAdd
      setTranslateY(_shouldAdd ? deltaY + addHeight : deltaY)
    } else {
      setTranslateX(deltaX)
    }
  }

  const handleTouchEnd = () => {
    if (isSmallScreen) {
      const container = cardRef.current
      const header = cardRef.current?.querySelector('[data-header]')
      const headerHeight = header?.clientHeight || 20
      const addHeight = (container?.clientHeight || headerHeight) - headerHeight
      const _translateY = translateY - (shouldAdd.current ? addHeight : 0)
      if (_translateY > 100) {
        setIsCollapsed(true)
      } else if (_translateY < -100) {
        setIsCollapsed(false)
      }
      setTranslateY(0)
    } else {
      if (translateX > 100) {
        setIsCollapsed(true)
      } else if (translateX < -100) {
        setIsCollapsed(false)
      }
      setTranslateX(0)
    }
  }

  const dragTranslate = isSmallScreen
    ? translateY
      ? `translateY(${translateY}px)`
      : ''
    : translateX
      ? `translateX(${translateX}px)`
      : ''
  const collapsedTranslate = isCollapsed
    ? isSmallScreen
      ? 'translateY(90%)'
      : 'translateX(96%)'
    : ''

  const translateStyle = dragTranslate || collapsedTranslate

  if (!src) return null

  return (
    <div
      className={clsx(
        'fixed right-0 bottom-0 z-[52] w-full md:w-96',
        !translateX && !translateY && 'transition-transform',
        isCollapsed && 'md:hover:!translate-x-80'
      )}
      style={{
        transform: translateStyle
      }}
    >
      <audio
        src={src}
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onPlayEnd}
        autoPlay={autoPlay ?? storageAutoPlay}
        {...rest}
        controls={false}
        hidden
        ref={audioRef}
      />

      <Card
        ref={cardRef}
        className={clsx(
          'border-none bg-background/60 dark:bg-default-300/50 w-full max-w-full transform transition-transform backdrop-blur-md duration-300 overflow-visible',
          isSmallScreen ? 'rounded-t-3xl' : 'md:rounded-l-xl'
        )}
        classNames={{
          body: 'p-0'
        }}
        shadow="sm"
        radius="none"
      >
        {isMediumUp && (
          <Button
            isIconOnly
            className={clsx(
              'absolute data-[hover]:bg-foreground/10 text-lg z-50',
              isCollapsed
                ? 'top-0 left-0 w-full h-full rounded-xl bg-opacity-0 hover:bg-opacity-30'
                : 'top-3 -left-8 rounded-l-full bg-opacity-50 backdrop-blur-md'
            )}
            variant="solid"
            color="primary"
            size="sm"
            onPress={() => setIsCollapsed(!isCollapsed)}
          >
            <FaRegHandPointRight />
          </Button>
        )}
        {isSmallScreen && (
          <CardHeader
            data-header
            className="flex-row justify-center pt-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="w-24 h-2 rounded-full bg-content2-foreground shadow-sm"></div>
          </CardHeader>
        )}
        <CardBody>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center overflow-hidden p-6 md:p-2 m-0">
            <div className="relative col-span-6 md:col-span-4 flex justify-center">
              <Image
                alt="Album cover"
                className="object-cover"
                classNames={{
                  wrapper: 'w-36 aspect-square md:w-24 flex',
                  img: 'block w-full h-full'
                }}
                shadow="md"
                src={cover}
                width="100%"
              />
            </div>

            <div className="flex flex-col col-span-6 md:col-span-8">
              <div className="flex flex-col gap-0">
                <h1 className="font-medium truncate">{title}</h1>
                <p className="text-xs text-foreground/80 truncate">{artist}</p>
              </div>

              <div className="flex flex-col">
                <Slider
                  aria-label="Music progress"
                  classNames={{
                    track: 'bg-default-500/30 border-none',
                    thumb: 'w-2 h-2 after:w-1.5 after:h-1.5',
                    filler: 'rounded-full'
                  }}
                  color="foreground"
                  value={currentProgress || 0}
                  defaultValue={0}
                  size="sm"
                  onChange={(value) => {
                    value = Array.isArray(value) ? value[0] : value
                    const audio = audioRef.current
                    if (audio) {
                      audio.currentTime = (value / 100) * duration
                    }
                  }}
                />
                <div className="flex justify-between h-3">
                  <p className="text-xs">
                    {Math.floor(currentTime / 60)}:
                    {Math.floor(currentTime % 60)
                      .toString()
                      .padStart(2, '0')}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {Math.floor(duration / 60)}:
                    {Math.floor(duration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center justify-center">
                <Tooltip
                  content={
                    mode === PlayMode.Loop
                      ? '列表循环'
                      : mode === PlayMode.Random
                        ? '随机播放'
                        : '单曲循环'
                  }
                >
                  <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10 text-lg md:text-medium"
                    radius="full"
                    variant="light"
                    size="md"
                    onPress={changeMode}
                  >
                    {mode === PlayMode.Loop && (
                      <FaRepeat className="text-foreground/80" />
                    )}
                    {mode === PlayMode.Random && (
                      <FaShuffle className="text-foreground/80" />
                    )}
                    {mode === PlayMode.Single && (
                      <TbRepeatOnce className="text-foreground/80 text-xl" />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip content="上一首">
                  <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10 text-2xl md:text-xl"
                    radius="full"
                    variant="light"
                    size="md"
                    onPress={pressPrevious}
                  >
                    <BiSolidSkipPreviousCircle />
                  </Button>
                </Tooltip>
                <Tooltip content={isPlaying ? '暂停' : '播放'}>
                  <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10 text-3xl md:text-3xl"
                    radius="full"
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (isPlaying) {
                        audioRef.current?.pause()
                        setStorageAutoPlay(false)
                      } else {
                        audioRef.current?.play()
                      }
                    }}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                  </Button>
                </Tooltip>
                <Tooltip content="下一首">
                  <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10 text-2xl md:text-xl"
                    radius="full"
                    variant="light"
                    size="md"
                    onPress={pressNext}
                  >
                    <BiSolidSkipNextCircle />
                  </Button>
                </Tooltip>
                <Popover
                  placement="top"
                  classNames={{
                    content: 'bg-opacity-30 backdrop-blur-md'
                  }}
                >
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      className="data-[hover]:bg-foreground/10 text-xl md:text-xl"
                      radius="full"
                      variant="light"
                      size="md"
                    >
                      <VolumeHighIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Slider
                      orientation="vertical"
                      showTooltip
                      aria-label="Volume"
                      className="h-40"
                      color="primary"
                      defaultValue={volume}
                      onChange={(value) => {
                        value = Array.isArray(value) ? value[0] : value
                        volumeChange(value)
                      }}
                      startContent={<VolumeHighIcon className="text-2xl" />}
                      size="sm"
                      endContent={<VolumeLowIcon className="text-2xl" />}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

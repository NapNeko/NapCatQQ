// Songs Context
import { useLocalStorage } from '@uidotdev/usehooks'
import { createContext, useEffect, useState } from 'react'

import { PlayMode } from '@/const/enum'
import key from '@/const/key'

import AudioPlayer from '@/components/audio_player'

import { get163MusicListSongs, getNextMusic } from '@/utils/music'

import type { FinalMusic } from '@/types/music'

export interface MusicContextProps {
  setListId: (id: string) => void
  listId: string
  onNext: () => void
  onPrevious: () => void
}

export interface MusicProviderProps {
  children: React.ReactNode
}

export const AudioContext = createContext<MusicContextProps>({
  setListId: () => {},
  listId: '5438670983',
  onNext: () => {},
  onPrevious: () => {}
})

const AudioProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [listId, setListId] = useLocalStorage(key.musicID, '5438670983')
  const [musicList, setMusicList] = useState<FinalMusic[]>([])
  const [musicId, setMusicId] = useState<number>(0)
  const [playMode, setPlayMode] = useState<PlayMode>(PlayMode.Loop)
  const music = musicList.find((music) => music.id === musicId)
  const [token] = useLocalStorage(key.token, '')
  const onNext = () => {
    const nextID = getNextMusic(musicList, musicId, playMode)
    setMusicId(nextID)
  }
  const onPrevious = () => {
    const index = musicList.findIndex((music) => music.id === musicId)
    if (index === 0) {
      setMusicId(musicList[musicList.length - 1].id)
    } else {
      setMusicId(musicList[index - 1].id)
    }
  }
  const onPlayEnd = () => {
    const nextID = getNextMusic(musicList, musicId, playMode)
    setMusicId(nextID)
  }
  const changeMode = (mode: PlayMode) => {
    setPlayMode(mode)
  }
  const fetchMusicList = async (id: string) => {
    const res = await get163MusicListSongs(id)
    setMusicList(res)
    setMusicId(res[0].id)
  }
  useEffect(() => {
    if (listId && token) fetchMusicList(listId)
  }, [listId, token])
  return (
    <AudioContext.Provider
      value={{
        setListId,
        listId,
        onNext,
        onPrevious
      }}
    >
      <AudioPlayer
        title={music?.title}
        src={music?.url || ''}
        artist={music?.artist}
        cover={music?.cover}
        mode={playMode}
        pressNext={onNext}
        pressPrevious={onPrevious}
        onPlayEnd={onPlayEnd}
        onChangeMode={changeMode}
      />
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider

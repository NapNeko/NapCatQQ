import { PlayMode } from '@/const/enum'

import WebUIManager from '@/controllers/webui_manager'
import type {
  FinalMusic,
  Music163ListResponse,
  Music163URLResponse
} from '@/types/music'

/**
 * 获取网易云音乐歌单
 * @param id 歌单id
 * @returns 歌单信息
 */
export const get163MusicList = async (id: string) => {
  let res = await WebUIManager.proxy<Music163ListResponse>(
    'https://wavesgame.top/playlist/track/all?id=' + id
  )
  // const res = await request.get<Music163ListResponse>(
  //   `https://wavesgame.top/playlist/track/all?id=${id}`
  // )
  if (res?.data?.code !== 200) {
    throw new Error('获取歌曲列表失败')
  }
  return res.data
}

/**
 * 获取歌曲地址
 * @param ids 歌曲id
 * @returns 歌曲地址
 */
export const getSongsURL = async (ids: number[]) => {
  const _ids = ids.reduce((prev, cur, index) => {
    const groupIndex = Math.floor(index / 10)
    if (!prev[groupIndex]) {
      prev[groupIndex] = []
    }
    prev[groupIndex].push(cur)
    return prev
  }, [] as number[][])
  const res = await Promise.all(
    _ids.map(async (id) => {
      const res = await WebUIManager.proxy<Music163URLResponse>(
        `https://wavesgame.top/song/url?id=${id.join(',')}`
      )
      if (res?.data?.code !== 200) {
        throw new Error('获取歌曲地址失败')
      }
      return res.data.data
    })
  )
  const result = res.reduce((prev, cur) => {
    return prev.concat(...cur)
  }, [])
  return result
}

/**
 * 获取网易云音乐歌单歌曲
 * @param id 歌单id
 * @returns 歌曲信息
 */
export const get163MusicListSongs = async (id: string) => {
  const listRes = await get163MusicList(id)
  const songs = listRes.songs.map((song) => song.id)
  const songsRes = await getSongsURL(songs)
  const finalMusic: FinalMusic[] = []
  for (let i = 0; i < listRes.songs.length; i++) {
    const song = listRes.songs[i]
    const music = songsRes.find((s) => s.id === song.id)
    const songURL = music?.url
    if (songURL) {
      finalMusic.push({
        id: song.id,
        url: songURL.replace(/http:\/\//, '//').replace(/https:\/\//, '//'),
        title: song.name,
        artist: song.ar.map((p) => p.name).join('/'),
        cover: song.al.picUrl
      })
    }
  }
  return finalMusic
}

/**
 * 获取随机音乐
 * @param ids 歌曲id
 * @param currentId 当前音乐id
 * @returns 随机音乐id
 */
export const getRandomMusic = (ids: number[], currentId: number): number => {
  const randomIndex = Math.floor(Math.random() * ids.length)
  const randomId = ids[randomIndex]
  if (randomId === currentId) {
    return getRandomMusic(ids, currentId)
  }
  return randomId
}

/**
 * 获取下一首音乐id
 * @param ids 歌曲id
 * @param currentId 当前音乐ID
 * @param mode 播放模式
 */
export const getNextMusic = (
  musics: FinalMusic[],
  currentId: number,
  mode: PlayMode
): number => {
  const ids = musics.map((music) => music.id)
  if (mode === PlayMode.Loop) {
    const currentIndex = ids.findIndex((id) => id === currentId)
    const nextIndex = currentIndex + 1
    return ids[nextIndex] || ids[0]
  }
  if (mode === PlayMode.Random) {
    return getRandomMusic(ids, currentId)
  }
  return currentId
}

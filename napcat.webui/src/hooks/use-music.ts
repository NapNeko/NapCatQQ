import React from 'react'

import { AudioContext } from '@/contexts/songs'

const useMusic = () => {
  const music = React.useContext(AudioContext)

  return music
}

export default useMusic

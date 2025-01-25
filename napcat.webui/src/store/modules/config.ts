import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

interface ConfigState {
  value: OneBotConfig
}

const initialState: ConfigState = {
  value: {
    network: {
      httpServers: [],
      httpClients: [],
      httpSseServers: [],
      websocketServers: [],
      websocketClients: []
    },
    musicSignUrl: '',
    enableLocalFile2Url: false,
    parseMultMsg: true
  }
}

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<OneBotConfig>) => {
      state.value = action.payload
    }
  }
})

export const { updateConfig } = configSlice.actions

export const selectCount = (state: RootState) => state.config.value

export default configSlice.reducer

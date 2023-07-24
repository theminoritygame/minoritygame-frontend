import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameHelper } from 'src/helpers/gameHelper';
import { GameStateInfo, GameStaticInfo, GameAssets } from 'src/models/models';
import { RootState } from '../store';

export interface GameSliceState {
    gameID: number | undefined,
    gameStateInfo: GameStateInfo | undefined,
    gameStaticInfo: GameStaticInfo | undefined,
    assets: GameAssets | undefined,
    totalVotes: number | undefined,
}

const initialState: GameSliceState = {
    gameID: undefined,
    gameStateInfo: undefined,
    gameStaticInfo: undefined,
    assets: undefined,
    totalVotes: undefined,
}

export const refreshGameData = createAsyncThunk('gameSlice/refreshGameData', async (payload: GameHelper, thunkApi) => {
  let info = undefined
  try {
    info = await payload.fetchGamesInfoIfChanged((thunkApi.getState() as RootState).gameInfo)
  } catch(e) {
  }
  return info;
});

// Create a slice using createSlice
const gameRxSlice = createSlice({
  name: 'gameSlice',
  initialState,
  reducers: {
    updateGameStateData(state, action: PayloadAction<GameSliceState>) {
      state.gameID = action.payload.gameID
      state.gameStateInfo = action.payload.gameStateInfo
      state.gameStaticInfo = action.payload.gameStaticInfo
      state.assets = action.payload.assets
      state.totalVotes = action.payload.totalVotes
    },
    updateTotalVotes(state, action: PayloadAction<number>) {
      state.totalVotes = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshGameData.fulfilled, (state, action: PayloadAction<GameSliceState | undefined>) => {
        if (action.payload) {
          state.gameID = action.payload.gameID
          state.gameStateInfo = action.payload.gameStateInfo
          state.gameStaticInfo = action.payload.gameStaticInfo
          state.assets = action.payload.assets
          state.totalVotes = action.payload.totalVotes
        }
      })
  },
});

// Export the actions and reducer
export const { updateGameStateData, updateTotalVotes } = gameRxSlice.actions;
export default gameRxSlice.reducer;
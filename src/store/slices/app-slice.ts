import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameSliceState, refreshGameData } from './game-slice';

export interface AppSlice {
    isLoaded: boolean,
}

const initialState: AppSlice = {
    isLoaded: false
}

// Create a slice using createSlice
const appRxSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshGameData.fulfilled, (state, action: PayloadAction<GameSliceState | undefined>) => {
        state.isLoaded = true
      })
  },
});

// Export the actions and reducer
export default appRxSlice.reducer;
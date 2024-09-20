import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    follows: [],
    followers: [],
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload;
    },
    setFollows: (state, action) => {
      state.follows = action.payload;
    },
    setFollowers: (state, action) => {
      state.followers = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.follows = [];
      state.followers = [];
    },
  },
});

export const { loginSuccess, setFollows, setFollowers, logout } = userSlice.actions;
export default userSlice.reducer;

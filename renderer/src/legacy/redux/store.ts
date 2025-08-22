import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice';

const store = configureStore({
  reducer: dataReducer
});

export default store;
// 导出 RootState 类型
export type RootState = ReturnType<typeof store.getState>;

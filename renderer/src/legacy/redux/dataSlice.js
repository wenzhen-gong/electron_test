import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { flushSync } from 'react-dom';

const initialState = {
  datafile: [], // Initial state that'll be updated to action payload (datafile)
  runTabConfig: {},
  headers: [],
  contentType: null,
  validUserInput: { valid: false, flag: false, error: null }
};

export const runTest = createAsyncThunk('datafile/runTest', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  // console.log('config in runTest Thunk: ', state.runTabConfig);
  // console.log('contentType in runTest Thunk: ', state.contentType);
  // console.log('headers in runTest Thunk: ', state.headers);
  let finalHeaders = {};
  if (state.contentType) {
    finalHeaders['Content-Type'] = state.contentType;
  }
  state.headers.forEach((header) => {
    finalHeaders[header.key] = header.value;
  });
  // console.log('finalHeaders in runTest Thunk: ', finalHeaders);
  let finalRunTabConfig = {...state.runTabConfig, finalHeaders}
    console.log('finalRunTabConfig in runTest Thunk: ', finalRunTabConfig);

  const result = await window.api.runLoadTest(finalRunTabConfig);
  return result;
});

const dataSlice = createSlice({
  name: 'datafile',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.datafile = action.payload;
    },

    setRunTabData: (state, action) => {
      state.runTabConfig = action.payload;
    },
    resetRunTabConfig: () => initialState,
    setContentType: (state, action) => {
      state.contentType = action.payload;
    },
    setHeaders: (state, action) => {
      state.headers = action.payload;
    },
    setValidUserInput: (state, action) => {
      state.validUserInput = action.payload;
    },
    currentSessionConfig: (state, action) => {
      state.configFile = action.payload;
    },
    createSession: (state, action) => {
      const newSession = {};
      newSession.sessionId = Date.now();
      newSession.sessionName = 'New Session';
      newSession.requests = [];
      newSession.createdOn = newSession.sessionId;
      newSession.lastModified = newSession.sessionId;
      state.datafile.push(newSession);

      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },
    addRequest: (state, action) => {
      const sessionId = action.payload;
      const newRequest = {};
      newRequest.requestId = Date.now();
      newRequest.requestName = 'New Request';
      newRequest.method = 'GET';
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile[i].requests.push(newRequest);
        }
      }
      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },
    duplicateSession: (state, action) => {
      const oldSession = action.payload;
      const newSession = JSON.parse(JSON.stringify(oldSession));
      newSession.sessionId = Date.now();
      newSession.sessionName = 'Copy of ' + newSession.sessionName;
      newSession.createdOn = newSession.sessionId;
      newSession.lastModified = newSession.sessionId;
      state.datafile.push(newSession);

      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },
    deleteSession: (state, action) => {
      const sessionId = action.payload;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile.splice(i, 1);
        }
      }

      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },
    renameSession: (state, action) => {
      const sessionId = action.payload.sessionId;
      const newName = action.payload.newName;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile[i].sessionName = newName;
          break;
        }
      }

      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },
    updateSessionOverview: (state, action) => {
      const sessionId = action.payload.sessionId;
      const newOverview = action.payload.newOverview;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile[i].overview = newOverview;
          break;
        }
      }

      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },
    deleteRequest: (state, action) => {
      const sessionId = action.payload.sessionId;
      const requestId = action.payload.requestId;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          for (let j = 0; j < state.datafile[i].requests.length; j++) {
            if (state.datafile[i].requests[j].requestId == requestId) {
              state.datafile[i].requests.splice(j, 1);
              break;
            }
          }
          break;
        }
      }

      // call main process to write data file
      window.electronAPI.writeDataFile(JSON.stringify(state.datafile));
    },

    // For presentation purpose only (delete after presentation 01/25/2024, also setDemoData on 55)
    setDemoData: (state, action) => {
      state.demo = action.payload;
    }
  },
  // Reducers for asyncthunk
  extraReducers: (builder) => {
    builder.addCase(runTest.fulfilled, (state, action) => {
      console.log(action.payload);
    });
  }
});

export const {
  setData,
  setRunTabData,
  resetRunTabConfig,
  setContentType,
  setHeaders,
  setValidUserInput,
  currentSessionConfig,
  createSession,
  setDemoData,
  addRequest,
  duplicateSession,
  deleteSession,
  renameSession,
  updateSessionOverview,
  deleteRequest
} = dataSlice.actions;
export default dataSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Request, Session, State, RunTabConfig, Header, Param, ValidUserInput } from '../model'

const initialState: State = {
  datafile: [], // Initial state that'll be updated to action payload (datafile)
  runTabConfig: {},
  headers: [],
  params: [],
  contentType: null,
  validUserInput: { valid: false, flag: false, error: null }
};

export const runTest = createAsyncThunk('datafile/runTest', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as State;
  // console.log('config in runTest Thunk: ', state.runTabConfig);
  // console.log('contentType in runTest Thunk: ', state.contentType);
  // console.log('headers in runTest Thunk: ', state.headers);
  // console.log('params in runTest Thunk: ', state.params);
  // let finalURL = state.runTabConfig.URL;
  // state.params.forEach((param) => (finalURL += '?' + param.key + '=' + param.value + '&'));

  const finalHeaders: Record<string, string> = {};
  if (state.contentType) {
    finalHeaders['Content-Type'] = state.contentType;
  }
  state.headers.forEach((header) => {
    finalHeaders[header.key] = header.value;
  });
  // console.log('finalHeaders in runTest Thunk: ', finalHeaders);
  let finalRunTabConfig = { ...state.runTabConfig, finalHeaders };
  // finalRunTabConfig.URL = finalURL;
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
    
    resetRunTabConfig: (state) => {
      state.runTabConfig = {};
      state.headers = [];
      state.params = [];
      state.contentType = null;
      state.validUserInput = { valid: false, flag: false, error: null };
    },
    
    setContentType: (state, action) => {
      state.contentType = action.payload;
    },
    
    setHeaders: (state, action) => {
      state.headers = action.payload;
    },
    
    setParams: (state, action) => {
      state.params = action.payload;
      console.log(state.params)
    },
    
    setValidUserInput: (state, action) => {
      state.validUserInput = action.payload;
    },
    
    currentSessionConfig: (state, action) => {
      state.configFile = action.payload;
    },
    
    createSession: (state) => {
      const sessionId = Date.now();
      const newSession: Session = {
        sessionId: sessionId,
        sessionName: 'New Session',
        overview: '',             // or some default text
        createdBy: 'anonymous',   // or actual user
        createdOn: sessionId,
        lastModified: sessionId,
        requests: [],
        servers: [],
        history: []
      };
      state.datafile.push(newSession)

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    
    addRequest: (state, action) => {
      const sessionId = action.payload.sessionId;
      const requestId = Date.now();
      const newRequest: Request = {
        requestId: requestId,
        requestName: 'New Request',
        method: 'GET',
        url: ''
      }
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          state.datafile[i].requests.push(newRequest);
        }
      }
      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    
    duplicateSession: (state, action) => {
      const oldSession = action.payload.session;
      const newSession = JSON.parse(JSON.stringify(oldSession)) as Session;
      newSession.sessionId = Date.now();
      newSession.sessionName = 'Copy of ' + newSession.sessionName;
      newSession.createdOn = newSession.sessionId;
      newSession.lastModified = newSession.sessionId;
      state.datafile.push(newSession);

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    
    deleteSession: (state, action) => {
      const sessionId = action.payload.sessionId;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          state.datafile.splice(i, 1);
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    
    renameSession: (state, action) => {
      const sessionId = action.payload.sessionId;
      const newName = action.payload.newName;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          state.datafile[i].sessionName = newName;
          break;
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    
    updateSessionOverview: (state, action) => {
      const sessionId = action.payload.sessionId;
      const newOverview = action.payload.newOverview;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          state.datafile[i].overview = newOverview;
          break;
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    
    deleteRequest: (state, action) => {
      const sessionId = action.payload.sessionId;
      const requestId = action.payload.requestId;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          for (let j = 0; j < state.datafile[i].requests.length; j++) {
            if (state.datafile[i].requests[j].requestId === requestId) {
              state.datafile[i].requests.splice(j, 1);
              break;
            }
          }
          break;
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },

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
  setParams,
  setValidUserInput,
  currentSessionConfig,
  createSession,
  addRequest,
  duplicateSession,
  deleteSession,
  renameSession,
  updateSessionOverview,
  deleteRequest
} = dataSlice.actions;

export default dataSlice.reducer;

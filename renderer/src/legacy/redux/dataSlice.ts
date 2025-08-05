import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { flushSync } from 'react-dom'
import {Request, Session, State} from '../model'

const initialState: State = {
  datafile: [], // Initial state that'll be updated to action payload (datafile)
  runTabConfig: {}
}

export const runTest = createAsyncThunk<
any,             // 返回值类型（你可以改成具体类型）
void,            // 参数类型
{ state: State } // thunkAPI 类型
>('datafile/runTest', async (_, thunkAPI) => {
  const state = thunkAPI.getState()
  console.log('state in runTest Thunk: ', state.runTabConfig)
  const result = await window.api.runLoadTest(state.runTabConfig)
  return result
})

const dataSlice = createSlice({
  name: 'datafile',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.datafile = action.payload
    },

    setRunTabData: (state, action) => {
      state.runTabConfig = action.payload
    },

    currentSessionConfig: (state, action) => {
      state.configFile = action.payload
    },
    createSession: (state, action) => {
    
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
      const sessionId = action.payload
      const requestId = Date.now();
      const newRequest: Request = {
        requestId: requestId,
        requestName: 'New Request',
        method: 'GET',
        url: ''
      }
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile[i].requests.push(newRequest)
        }
      }
      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    duplicateSession: (state, action) => {
      const oldSession = action.payload
      const newSession = JSON.parse(JSON.stringify(oldSession))
      newSession.sessionId = Date.now()
      newSession.sessionName = 'Copy of ' + newSession.sessionName
      newSession.createdOn = newSession.sessionId
      newSession.lastModified = newSession.sessionId
      state.datafile.push(newSession)

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    deleteSession: (state, action) => {
      const sessionId = action.payload
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile.splice(i, 1)
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    renameSession: (state, action) => {
      const sessionId = action.payload.sessionId
      const newName = action.payload.newName
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile[i].sessionName = newName
          break
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    updateSessionOverview: (state, action) => {
      const sessionId = action.payload.sessionId
      const newOverview = action.payload.newOverview
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          state.datafile[i].overview = newOverview
          break
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },
    deleteRequest: (state, action) => {
      const sessionId = action.payload.sessionId
      const requestId = action.payload.requestId
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId == sessionId) {
          for (let j = 0; j < state.datafile[i].requests.length; j++) {
            if (state.datafile[i].requests[j].requestId == requestId) {
              state.datafile[i].requests.splice(j, 1)
              break
            }
          }
          break
        }
      }

      // call main process to write data file
      window.api.writeDataFile(JSON.stringify(state.datafile))
    },

  },
  // Reducers for asyncthunk
  extraReducers: (builder) => {
    builder.addCase(runTest.fulfilled, (state, action) => {
      console.log(action.payload)
    })
  }
})

export const {
  setData,
  setRunTabData,
  currentSessionConfig,
  createSession,
  addRequest,
  duplicateSession,
  deleteSession,
  renameSession,
  updateSessionOverview,
  deleteRequest
} = dataSlice.actions
export default dataSlice.reducer

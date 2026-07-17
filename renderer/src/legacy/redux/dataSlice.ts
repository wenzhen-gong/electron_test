import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Request, Session, State, Result, ResultMetadata, RunTabConfig } from '../model';
import { apiUrl } from '../config';

/** 仅在已登录时将 session 数据持久化到本地 datafile.json。 */
function persistDatafileIfLoggedIn(state: State): void {
  if (state.user) {
    window.api.writeDataFile(JSON.stringify(state.datafile));
  }
}

export const loadDataFile = createAsyncThunk(
  'datafile/loadDataFile',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as State;
    if (!state.user) {
      return rejectWithValue('Not logged in');
    }
    const raw = await window.api.readDataFile();
    return JSON.parse(raw) as Session[];
  }
);

const initialState: State = {
  datafile: [], // Initial state that'll be updated to action payload (datafile)
  runTabConfig: {},
  pendingSessionBootstrap: undefined,
  validUserInput: { error: null },
  runTestRunning: false,
  result: undefined,
  // 这里开始是signup signin的model里面的state
  signupError: null,
  openSignup: false,
  signupLoading: false,
  signupFormData: { username: '', email: '', password: '' },

  signinError: null,
  openSignin: false,
  signinLoading: false,
  signinFormData: { username: '', password: '' },
  // 这里开始是后端返回的state
  user: null,
  // only for testing
  // user: { username: 'wzg', email: 'wzg@email.com' },
  // 这里开始是Profile的state
  openProfile: false
};

export const runTest = createAsyncThunk(
  'datafile/runTest',
  async (sessionId: string, thunkAPI) => {
    const state = thunkAPI.getState() as State;
    const finalRunTabConfig = { ...state.runTabConfig };

    // Get all requests for the current session
    const sessionIdNum = Number(sessionId);
    const currentSession = state.datafile.find((session) => session.sessionId === sessionIdNum);
    const requests = currentSession?.requests || [];

    const result: Result = await window.api.runLoadTest({
      ...finalRunTabConfig,
      requests: requests
    });

    // Send a fetch request to backend to save result
    const saveResultRequest = {
      userId: state.user?.id,
      sessionId: sessionId,
      version: '1.0.0',
      config: finalRunTabConfig,
      result: result
    };
    const saveResultResponse = await fetch(apiUrl('/benchmarkresult'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saveResultRequest),
      credentials: 'include'
    }).then((res) => res.json());
    const resultMetadata: ResultMetadata = {
      id: saveResultResponse.id,
      userId: saveResultResponse.userId,
      timestamp: saveResultResponse.timestamp,
      sessionId: saveResultResponse.sessionId,
      version: saveResultResponse.version,
      successRatio: saveResultResponse.successRatio,
      p50Latency: saveResultResponse.p50Latency,
      p95Latency: saveResultResponse.p95Latency,
      throughput: saveResultResponse.throughput
    };

    return { result, resultMetadata };
  },
  {
    // 防止重复点击或 effect 重入导致同一轮压测被触发多次、落库多条记录。
    condition: (_, { getState }) => !(getState() as State).runTestRunning
  }
);

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
        overview: '', // or some default text
        createdBy: 'anonymous', // or actual user
        createdOn: sessionId,
        lastModified: sessionId,
        requests: [],
        servers: [],
        history: []
      };
      state.datafile.push(newSession);

      persistDatafileIfLoggedIn(state);
    },

    /**
     * Chat tooling：一次创建 New Session + New Request，并挂起 runTab 预填，
     * 等导航到该 session 后再写入（避免 clearSessionState 清掉）。
     */
    createSessionFromChat: (state, action) => {
      const payload = action.payload as {
        sessionName?: string;
        requestName?: string;
        method?: Request['method'];
        url?: string;
        runTabConfig?: RunTabConfig;
      };

      const sessionId = Date.now();
      const requestId = sessionId + 1;
      const method = (payload.method || 'GET') as Request['method'];
      const newRequest: Request = {
        requestId,
        requestName: payload.requestName?.trim() || 'New Request',
        method,
        url: payload.url || '',
        reqBody: '',
        headers: [],
        params: [],
        contentType: null
      };
      const newSession: Session = {
        sessionId,
        sessionName: payload.sessionName?.trim() || 'New Session',
        overview: '',
        createdBy: state.user?.username || 'anonymous',
        createdOn: sessionId,
        lastModified: sessionId,
        requests: [newRequest],
        servers: [],
        history: []
      };
      state.datafile.push(newSession);
      state.pendingSessionBootstrap = {
        sessionId,
        runTabConfig: payload.runTabConfig || {},
        openRunTab: true
      };
      persistDatafileIfLoggedIn(state);
    },

    applyPendingSessionBootstrap: (state) => {
      const pending = state.pendingSessionBootstrap;
      if (!pending) {
        return;
      }
      state.runTabConfig = { ...pending.runTabConfig };
      state.pendingSessionBootstrap = undefined;
    },

    clearPendingSessionBootstrap: (state) => {
      state.pendingSessionBootstrap = undefined;
    },

    addRequest: (state, action) => {
      const sessionId = action.payload.sessionId;
      const requestId = Date.now();
      const newRequest: Request = {
        requestId: requestId,
        requestName: 'New Request',
        method: 'GET',
        url: '',
        reqBody: '',
        headers: [],
        params: [],
        contentType: null
      };
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          state.datafile[i].requests.push(newRequest);
        }
      }
      persistDatafileIfLoggedIn(state);
    },

    duplicateSession: (state, action) => {
      const oldSession = action.payload.session;
      const newSession = JSON.parse(JSON.stringify(oldSession)) as Session;
      newSession.sessionId = Date.now();
      newSession.sessionName = 'Copy of ' + newSession.sessionName;
      newSession.createdOn = newSession.sessionId;
      newSession.lastModified = newSession.sessionId;
      state.datafile.push(newSession);

      persistDatafileIfLoggedIn(state);
    },

    deleteSession: (state, action) => {
      const sessionId = action.payload.sessionId;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          state.datafile.splice(i, 1);
        }
      }

      persistDatafileIfLoggedIn(state);
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

      persistDatafileIfLoggedIn(state);
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

      persistDatafileIfLoggedIn(state);
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

      persistDatafileIfLoggedIn(state);
    },
    updateRequest: (state, action) => {
      const sessionId = action.payload.sessionId;
      const requestId = action.payload.requestId;
      const updates = action.payload.updates;
      for (let i = 0; i < state.datafile.length; i++) {
        if (state.datafile[i].sessionId === sessionId) {
          for (let j = 0; j < state.datafile[i].requests.length; j++) {
            if (state.datafile[i].requests[j].requestId === requestId) {
              state.datafile[i].requests[j] = {
                ...state.datafile[i].requests[j],
                ...updates
              };
              state.datafile[i].lastModified = Date.now();
              break;
            }
          }
          break;
        }
      }

      persistDatafileIfLoggedIn(state);
    },
    setSignupError: (state, action) => {
      state.signupError = action.payload;
    },
    setOpenSignup: (state, action) => {
      state.openSignup = action.payload;
    },
    setSignupLoading: (state, action) => {
      state.signupLoading = action.payload;
    },
    setSignupFormData: (state, action) => {
      state.signupFormData = action.payload;
    },

    setSigninError: (state, action) => {
      state.signinError = action.payload;
    },
    setOpenSignin: (state, action) => {
      state.openSignin = action.payload;
    },
    setSigninLoading: (state, action) => {
      state.signinLoading = action.payload;
    },
    setSigninFormData: (state, action) => {
      state.signinFormData = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (!action.payload) {
        // 登出后不再保留本地 session 数据（也不写入磁盘）。
        state.datafile = [];
        state.result = undefined;
        state.resultMetadata = undefined;
        state.runTabConfig = {};
        state.validUserInput.error = null;
      }
    },
    setOpenProfile: (state, action) => {
      state.openProfile = action.payload;
    },
    setResult: (state, action) => {
      state.result = action.payload.result;
      state.resultMetadata = action.payload.resultMetadata;
    },
    clearSessionState: (state) => {
      state.result = undefined;
      state.resultMetadata = undefined;
      state.runTabConfig = {};
      state.validUserInput.error = null;
    }
  },
  // Reducers for asyncthunk
  extraReducers: (builder) => {
    builder
      .addCase(loadDataFile.fulfilled, (state, action) => {
        state.datafile = action.payload;
      })
      .addCase(runTest.pending, (state) => {
        state.runTestRunning = true;
        state.validUserInput.error = null;
      })
      .addCase(runTest.fulfilled, (state, action) => {
        state.runTestRunning = false;
        state.result = action.payload.result;
        state.resultMetadata = action.payload.resultMetadata;
      })
      .addCase(runTest.rejected, (state, action) => {
        state.runTestRunning = false;
        state.validUserInput.error = action.error.message ?? 'Load test failed';
      });
  }
});

export const {
  setData,
  setRunTabData,
  setValidUserInput,
  currentSessionConfig,
  createSession,
  createSessionFromChat,
  applyPendingSessionBootstrap,
  clearPendingSessionBootstrap,
  addRequest,
  duplicateSession,
  deleteSession,
  renameSession,
  updateSessionOverview,
  deleteRequest,
  updateRequest,
  setSignupError,
  setOpenSignup,
  setSignupLoading,
  setSignupFormData,
  setSigninError,
  setOpenSignin,
  setSigninLoading,
  setSigninFormData,
  setUser,
  setOpenProfile,
  setResult,
  clearSessionState
} = dataSlice.actions;

export default dataSlice.reducer;

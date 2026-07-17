import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import OverviewTab from './tabs/OverviewTab';
import RunTab from './tabs/RunTab';
import AuthorizationTab from './tabs/AuthorizationTab';
import ResultTab from './tabs/ResultTab';
import HistoryTab from './tabs/HistoryTab';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@mui/material/Typography';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import AddIcon from '@mui/icons-material/Add';
import { RootState } from '../../redux/store';
import store from '../../redux/store';
import { clearSessionState, createSession, applyPendingSessionBootstrap } from '../../redux/dataSlice';

// https://mui.com/material-ui/react-tabs/
// Some helper functions to render tab bar & tab pannels.
interface CustomTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: CustomTabPanelProps): React.ReactElement {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
      sx={{ height: '100%', overflow: 'hidden', display: value === index ? 'block' : 'none' }}
    >
      <Box
        sx={{
          p: 3,
          height: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function a11yProps(index: number): { id: string; 'aria-controls': string } {
  return {
    id: `session-tab-${index}`,
    'aria-controls': `session-tabpanel-${index}`
  };
}

// Create styled components outside render functions to avoid recreating new components for each re-render.
const SessionsDiv = styled.div`
  padding: 50px;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

interface SessionsWelcomeProps {
  title: string;
  description: string;
  showCreateButton?: boolean;
  onCreateSession?: () => void;
}

const SessionsWelcome: React.FC<SessionsWelcomeProps> = ({
  title,
  description,
  showCreateButton,
  onCreateSession
}) => (
  <Box
    sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
      gap: 2,
      p: 4
    }}
  >
    <FolderOpenOutlinedIcon sx={{ fontSize: 64, opacity: 0.45 }} />
    <Typography variant="h5" sx={{ color: 'text.primary' }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ maxWidth: 420, textAlign: 'center' }}>
      {description}
    </Typography>
    {showCreateButton && onCreateSession && (
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateSession} sx={{ mt: 1 }}>
        Create Session
      </Button>
    )}
  </Box>
);

const Sessions: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const sessionId = params.id;
  const sessions = useSelector((state: RootState) => state.datafile);
  const hasSessions = sessions.length > 0;
  const sessionExists =
    !!sessionId && sessions.some((s) => s.sessionId.toString() === sessionId);
  const showSessionTabs = hasSessions && sessionExists;

  const handleCreateSession = (): void => {
    dispatch(createSession());
    const created = store.getState().datafile.at(-1);
    if (created) {
      navigate(`/sessions/${created.sessionId}`);
    }
  };

  // 无 session 或 URL 指向已删除的 session 时，回到 sessions 根路径。
  useEffect(() => {
    if (!sessionId) {
      return;
    }
    if (!hasSessions || !sessionExists) {
      navigate('/sessions', { replace: true });
    }
  }, [sessionId, hasSessions, sessionExists, navigate]);

  // Tab bar's state that represents the currently selected tab.
  // 0 = overview, 1 = authorization, 2 = run, 3 = result, 4 = history.
  const [currentTab, setCurrentTab] = useState<number>(0); // Overview
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };

  // 必须从 undefined 起算：若初始化成当前 sessionId，从 Chat 导航进来时
  // 「切换」与「首次挂载」两个分支都不会进，pending 预填会丢失。
  const prevSessionIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!sessionId) {
      return;
    }
    if (prevSessionIdRef.current === sessionId) {
      return;
    }

    const isFirstEntry = prevSessionIdRef.current === undefined;
    prevSessionIdRef.current = sessionId;

    dispatch(clearSessionState());

    const pending = store.getState().pendingSessionBootstrap;
    const sessionIdNum = Number(sessionId);
    if (pending && pending.sessionId === sessionIdNum) {
      dispatch(applyPendingSessionBootstrap());
      setCurrentTab(pending.openRunTab ? 2 : 0);
      return;
    }

    // 普通切换 session 时回到 Overview；首次进入且无 pending 则保持默认 tab
    if (!isFirstEntry) {
      setCurrentTab(0);
    }
  }, [sessionId, dispatch]);

  // Auto-switch to Result tab when test completes
  // Get result from state to detect when test completes
  const result = useSelector((state: RootState) => state.result);
  useEffect(() => {
    if (result) {
      setCurrentTab(3); // Switch to Result tab (index 3)
    }
  }, [result]);

  const sessionName = useSelector((state: RootState) => {
    if (!sessionId) {
      return null;
    }
    for (let i = 0; i < state.datafile.length; i++) {
      if (state.datafile[i].sessionId.toString() === sessionId) {
        return state.datafile[i].sessionName;
      }
    }
    return null;
  });

  const requestId = params.requestId;
  if (requestId) {
    return (
      <SessionsDiv>
        <Outlet />
      </SessionsDiv>
    );
  }

  if (!showSessionTabs) {
    return (
      <SessionsDiv>
        <SessionsWelcome
          title={hasSessions ? 'Select a session' : 'Create a session to start'}
          description={
            hasSessions
              ? 'Choose a session from the sidebar to view its overview, run tests, and browse results.'
              : 'Sessions hold your requests and benchmark runs. Create one to begin building and testing API flows.'
          }
          showCreateButton={!hasSessions}
          onCreateSession={handleCreateSession}
        />
      </SessionsDiv>
    );
  }

  return (
    <SessionsDiv>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '40px',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography
            variant="h6"
            component="h6"
            onClick={() => {
              setCurrentTab(0);
              navigate('/sessions/' + sessionId);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {sessionName}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ width: '70%', minWidth: 300 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="session tab bar"
            variant="fullWidth"
          >
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Authorization" {...a11yProps(1)} />
            <Tab label="Run" {...a11yProps(2)} />
            <Tab label="Result" {...a11yProps(3)} />
            <Tab label="History" {...a11yProps(4)} />
          </Tabs>
        </Box>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <CustomTabPanel value={currentTab} index={0}>
            <OverviewTab setCurrentTab={setCurrentTab} />
          </CustomTabPanel>
          <CustomTabPanel value={currentTab} index={1}>
            <AuthorizationTab />
          </CustomTabPanel>
          <CustomTabPanel value={currentTab} index={2}>
            <RunTab setCurrentTab={setCurrentTab} />
          </CustomTabPanel>
          <CustomTabPanel value={currentTab} index={3}>
            <ResultTab />
          </CustomTabPanel>
          <CustomTabPanel value={currentTab} index={4}>
            <HistoryTab setCurrentTab={setCurrentTab} currentTab={currentTab} />
          </CustomTabPanel>
        </Box>
      </Box>
    </SessionsDiv>
  );
};

export default Sessions;

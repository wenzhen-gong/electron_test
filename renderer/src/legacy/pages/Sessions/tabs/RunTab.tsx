import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setValidUserInput, setRunTabData, runTest, addRequest } from '../../../redux/dataSlice';
import { useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import { RootState, AppDispatch } from '../../../redux/store';
import { LoadMode } from '../../../model';
import RequestItem from '../../../sidebars/RequestItem';

interface RunTabProps {
  setCurrentTab?: (tab: number) => void;
}
 
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const RunTab: React.FC<RunTabProps> = () => {
  const urlParams = useParams();
  const sessionId = urlParams.id || 'default session';
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.user);
  const runTabConfig = useSelector((state: RootState) => state.runTabConfig);
  const validUserInput = useSelector((state: RootState) => state.validUserInput);
  const runTestRunning = useSelector((state: RootState) => state.runTestRunning);

  const mode: LoadMode = runTabConfig.mode === 'rate' ? 'rate' : 'concurrency';

  // Get the current session data
  const currentSession = useSelector((state: RootState) => {
    const sessionIdNum = Number(sessionId);
    for (let i = 0; i < state.datafile.length; i++) {
      if (state.datafile[i].sessionId === sessionIdNum) {
        return state.datafile[i];
      }
    }
    return null;
  });

  const handleInputChange = (inputName: string, inputValue: string | number): void => {
    const config: Record<string, string | number | undefined> = { ...runTabConfig };
    if (inputName === 'serverUrl' || inputName === 'mode') {
      config[inputName] = inputValue as string;
    } else {
      config[inputName] = Number(inputValue);
    }
    dispatch(setRunTabData(config));
  };

  const handleModeChange = (_e: React.MouseEvent<HTMLElement>, newMode: LoadMode | null): void => {
    if (newMode) {
      handleInputChange('mode', newMode);
    }
  };

  const fail = (error: string): void => {
    dispatch(setValidUserInput({ error }));
  };

  const isPositiveInt = (value: unknown): boolean =>
    typeof value === 'number' && Number.isInteger(value) && value > 0;

  const handleRun = (): void => {
    if (runTestRunning) {
      return;
    }

    // Server URL
    if (typeof runTabConfig.serverUrl !== 'string' || !URL_REGEX.test(runTabConfig.serverUrl)) {
      fail('Server URL must be a valid http(s) URL');
      return;
    }

    if (mode === 'concurrency') {
      if (!isPositiveInt(runTabConfig.concurrencyNumber)) {
        fail('Concurrency Number must be a positive integer');
        return;
      }
      const hasCount = isPositiveInt(runTabConfig.totalRequests);
      const hasDuration = isPositiveInt(runTabConfig.testDuration);
      if (!hasCount && !hasDuration) {
        fail('Provide a positive Total Requests or Test Duration');
        return;
      }
    } else {
      if (!isPositiveInt(runTabConfig.requestsPerSecond)) {
        fail('Requests / sec must be a positive integer');
        return;
      }
      if (!isPositiveInt(runTabConfig.testDuration)) {
        fail('Test Duration must be a positive integer');
        return;
      }
    }

    if (!user) {
      fail('Please log in first.');
      return;
    }

    dispatch(setRunTabData({ ...runTabConfig, mode }));
    dispatch(setValidUserInput({ error: null }));
    dispatch(runTest(sessionId));
  };

  return (
    <Box display={'flex'} gap={4}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleRun();
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '320px',
          marginLeft: '20px'
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Load model
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            fullWidth
            disabled={runTestRunning}
          >
            <ToggleButton value="concurrency">Concurrency</ToggleButton>
            <ToggleButton value="rate">Request rate</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
            {mode === 'concurrency'
              ? 'Closed loop: N clients each send back-to-back until a limit is hit.'
              : 'Open loop: requests are dispatched at a fixed rate for the duration.'}
          </Typography>
        </Box>

        <TextField
          label="Server URL"
          variant="outlined"
          value={runTabConfig.serverUrl || ''}
          onChange={(e) => handleInputChange('serverUrl', e.target.value)}
          fullWidth
          disabled={runTestRunning}
        />

        {mode === 'concurrency' ? (
          <>
            <TextField
              label="Concurrency Number"
              type="number"
              variant="outlined"
              value={runTabConfig.concurrencyNumber || ''}
              onChange={(e) => handleInputChange('concurrencyNumber', e.target.value)}
              fullWidth
              disabled={runTestRunning}
            />
            <TextField
              label="Total Requests"
              type="number"
              variant="outlined"
              helperText="Stop after this many session iterations (leave empty to use duration)"
              value={runTabConfig.totalRequests || ''}
              onChange={(e) => handleInputChange('totalRequests', e.target.value)}
              fullWidth
              disabled={runTestRunning}
            />
            <TextField
              label="Test Duration (s)"
              type="number"
              variant="outlined"
              helperText="Stop after this many seconds (leave empty to use total requests)"
              value={runTabConfig.testDuration || ''}
              onChange={(e) => handleInputChange('testDuration', e.target.value)}
              fullWidth
              disabled={runTestRunning}
            />
          </>
        ) : (
          <>
            <TextField
              label="Requests / sec"
              type="number"
              variant="outlined"
              value={runTabConfig.requestsPerSecond || ''}
              onChange={(e) => handleInputChange('requestsPerSecond', e.target.value)}
              fullWidth
              disabled={runTestRunning}
            />
            <TextField
              label="Test Duration (s)"
              type="number"
              variant="outlined"
              value={runTabConfig.testDuration || ''}
              onChange={(e) => handleInputChange('testDuration', e.target.value)}
              fullWidth
              disabled={runTestRunning}
            />
          </>
        )}

        <Stack direction="row" spacing={2} sx={{ marginTop: 1 }} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            disabled={runTestRunning}
            startIcon={runTestRunning ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {runTestRunning ? 'Running…' : 'Run'}
          </Button>
        </Stack>
        {validUserInput.error && (
          <Typography variant="body2" sx={{ color: 'error.main', marginTop: 1 }}>
            {validUserInput.error}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '400px',
          marginLeft: '20px',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 2
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Requests in this session
        </Typography>
        {currentSession && currentSession.requests.length > 0 ? (
          currentSession.requests.map((request) => (
            <RequestItem
              key={request.requestId}
              request={request}
              sessionId={currentSession.sessionId}
              requestId={request.requestId}
            />
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 2 }}>
            No requests in this session
          </Typography>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (currentSession) {
              dispatch(addRequest({ sessionId: currentSession.sessionId }));
            }
          }}
          sx={{ marginTop: 2 }}
          disabled={runTestRunning}
        >
          Add Request
        </Button>
      </Box>
    </Box>
  );
};

export default RunTab;

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SessionItem from './SessionItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import AddIcon from '@mui/icons-material/Add';
import { createSession } from '../redux/dataSlice.js';
import type { RootState } from '../redux/store.js';

const SessionsSide: React.FC = () => {
  const dispatch = useDispatch();
  const sessionState = useSelector((state: RootState) => state.datafile);

  const handleNewSession = (): void => {
    dispatch(createSession());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', letterSpacing: 0.5 }}>
          SESSIONS
        </Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleNewSession}>
          New
        </Button>
      </Box>
      <List dense sx={{ px: 1, py: 0, overflowY: 'auto', flexGrow: 1 }}>
        {sessionState.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', textAlign: 'center', mt: 3, px: 2 }}
          >
            No sessions yet. Create one to get started.
          </Typography>
        ) : (
          sessionState.map((session) => <SessionItem key={session.sessionId} session={session} />)
        )}
      </List>
    </Box>
  );
};

export default SessionsSide;

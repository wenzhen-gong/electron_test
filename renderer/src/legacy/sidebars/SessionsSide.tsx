import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import SessionItem from './SessionItem';
import Button from '@mui/material/Button';
import { createSession } from '../redux/dataSlice.js';
import AddIcon from '@mui/icons-material/Add';
import type { RootState } from '../redux/store.js';

const SessionsSideDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const SessionsSide: React.FC = () => {
  const dispatch = useDispatch();
  const sessionState = useSelector((state: RootState) => state.datafile);

  console.log('SessionsSide sessionState: ', sessionState);

  const sessions: React.ReactNode[] = [];
  for (let i = 0; i < sessionState.length; i++) {
    sessions.push(<SessionItem key={sessionState[i].sessionId} session={sessionState[i]} />);
  }

  const handleNewSession = (): void => {
    dispatch(createSession({}));
  };
  return (
    <SessionsSideDiv>
      <Button variant="contained" onClick={handleNewSession}>
        <AddIcon />
        New Session
      </Button>
      {sessions}
    </SessionsSideDiv>
  );
};

export default SessionsSide;

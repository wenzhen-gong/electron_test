import React from 'react';
import { SyntheticEvent } from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import { useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import SignInSignUp from './SignInSignUp';
import type { RootState } from '../redux/store';

const HeadBarContainer = styled.div`
  background-color: #1e1e1e;
  color: #ffffff;
  height: 60px;
  border-bottom-style: solid;
  border-bottom-color: #535353;
  border-bottom-with: 2px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 20px;
`;

const LogoDiv = styled.div`
  display: flex;
  width: 231px;
  height: 49px;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
  color: #71aaff;
  text-align: center;
  font-family: 'Fredoka', sans-serif;
  font-size: 25px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const SearchDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 40px;
`;

const HeadBar = () => {
  const navigate = useNavigate();

  // Get all sessions from data file.
  const allSessions = useSelector((state: RootState) => state.datafile);

  // Prepare all search values for the autocomplete search bar.
  const allValues: string[] = [];
  // For each value in "allValues", generate its corresponding redirect URL.
  const allURLs: string[] = [];
  for (let i = 0; i < allSessions.length; i++) {
    // The session itself.
    allValues.push(allSessions[i].sessionName);
    allURLs.push('/sessions/' + allSessions[i].sessionId);

    // All requests in this session.
    for (let j = 0; j < allSessions[i].requests.length; j++) {
      allValues.push(
        allSessions[i].sessionName + '  >>  ' + allSessions[i].requests[j].requestName
      );
      allURLs.push(
        '/sessions/' + allSessions[i].sessionId + '/' + allSessions[i].requests[j].requestId
      );
    }
  }

  const handleSelect = (e: SyntheticEvent, newValue: string | null) => {
    console.log('Selection is: ', newValue);
    for (let i = 0; i < allValues.length; ++i) {
      if (allValues[i] === newValue) {
        console.log("Selection's Id is: ", i);
        console.log("Selection's URL is: ", allURLs[i]);
        navigate(allURLs[i]);
      }
    }
  };

  return (
    <HeadBarContainer>
      <LogoDiv>KASKADE</LogoDiv>
      <SearchDiv>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={allValues}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Search Kaskade" />}
          onChange={handleSelect}
        />
      </SearchDiv>
      <SignInSignUp />
    </HeadBarContainer>
  );
};

export default HeadBar;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import OverviewTab from './tabs/OverviewTab';
import RunTab from './tabs/RunTab';
import AuthorizationTab from './tabs/AuthorizationTab';
import PreviousResultsTab from './tabs/PreviousResultsTab';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import ListIcon from '@mui/icons-material/List';
import Typography from '@mui/material/Typography';
import { RootState } from '../../redux/store';

// https://mui.com/material-ui/react-tabs/
// Some helper functions to render tab bar & tab pannels.
interface CustomTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: CustomTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `session-tab-${index}`,
    'aria-controls': `session-tabpanel-${index}`
  };
}

// Create styled components outside render functions to avoid recreating new components for each re-render.
const SessionsDiv = styled.div`
  padding: 50px;
`;

const Sessions: React.FC = () => {
  const configFile = useSelector((state: RootState) => state.configFile);
  console.log('Current configFile on SessionTab:', configFile);
  // Get the session Id from URL parameters.
  const params = useParams();
  const sessionId = params.id;

  // Get the session name to display on the title bar.
  const sessionName = useSelector((state: RootState) => {
    for (let i = 0; i < state.datafile.length; i++) {
      if (state.datafile[i].sessionId.toString() === sessionId) {
        return state.datafile[i].sessionName;
      }
    }
    return null;
  });

  const navigate = useNavigate();

  // Tab bar's state that represents the currently selected tab.
  // 0 = overview, 1 = authorization, 2 = run, 3 = previous results.
  const [currentTab, setCurrentTab] = useState<number>(0); // Overview
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTab(newValue);
  };

  // useEffect(() => {
  //     // Update the tab based on the selected session ID
  //     if (id) {
  //         setCurrentTab(0);   // Run
  //     } else {
  //         setCurrentTab(0);   // Overview
  //     }
  // }, [id]);

  return (
    <SessionsDiv>
      <Box
        sx={{
          display: 'flex',
          flexDirectin: 'row',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}
      >
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
      <Box sx={{ width: '100%' }}>
        <Box sx={{ width: '70%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="session tab bar"
            variant="fullWidth"
          >
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Authorization" {...a11yProps(1)} />
            <Tab label="Run" {...a11yProps(2)} />
            <Tab label="Previous Results" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTab} index={0}>
          <OverviewTab setCurrentTab={setCurrentTab} />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={1}>
          <AuthorizationTab />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={2}>
          <RunTab />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={3}>
          <PreviousResultsTab />
        </CustomTabPanel>
      </Box>
    </SessionsDiv>
  );
};

export default Sessions;

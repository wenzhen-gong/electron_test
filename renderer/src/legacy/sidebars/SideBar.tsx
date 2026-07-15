import React from 'react';
import styled from 'styled-components';
import SessionsSide from './SessionsSide';
import HistorySide from './HistorySide';
import ChatSide from './ChatSide';
import { palette } from '../theme';

const SideBarDiv = styled.div`
  background-color: ${palette.surface};
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid ${palette.border};
  overflow-y: auto;
`;

interface SideBarProps {
  page: string;
}

const SideBar: React.FC<SideBarProps> = (props) => {
  let sideBarContent: React.ReactNode;
  if (props.page === 'sessions') {
    sideBarContent = <SessionsSide />;
  } else if (props.page === 'history') {
    sideBarContent = <HistorySide />;
  } else if (props.page === 'chat') {
    sideBarContent = <ChatSide />;
  } else {
    sideBarContent = <p>Unknown page</p>;
  }

  return <SideBarDiv>{sideBarContent}</SideBarDiv>;
};

export default SideBar;

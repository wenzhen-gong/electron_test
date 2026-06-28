import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ListIcon from '@mui/icons-material/List';
import RestoreIcon from '@mui/icons-material/Restore';
import { palette } from '../theme';

const NavDiv = styled.div`
  background-color: ${palette.surface};
  width: 92px;
  border-right: 1px solid ${palette.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  flex-shrink: 0;
`;

interface NavBarProps {
  page: string;
}

const navButtons = [
  { key: 'sessions', label: 'Sessions', path: '/sessions', Icon: ListIcon },
  { key: 'history', label: 'History', path: '/history', Icon: RestoreIcon }
];

const NavBarDiv: React.FC<NavBarProps> = (props: NavBarProps) => {
  const navigate = useNavigate();

  return (
    <NavDiv>
      {navButtons.map(({ key, label, path, Icon }) => {
        const isActive = props.page === key;
        return (
          <Button
            key={key}
            variant="text"
            onClick={() => navigate(path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              width: 76,
              height: 72,
              borderRadius: 2,
              color: isActive ? 'primary.main' : 'text.secondary',
              backgroundColor: isActive ? 'rgba(113, 170, 255, 0.12)' : 'transparent',
              fontSize: 12,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.06)'
              }
            }}
          >
            <Icon fontSize="medium" />
            {label}
          </Button>
        );
      })}
    </NavDiv>
  );
};

export default NavBarDiv;

import { SyntheticEvent } from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import { useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';
import SignInSignUp from './SignInSignUp';
import type { RootState } from '../redux/store';
import UserInfo from './UserInfo';
import { palette } from '../theme';

const HeadBarContainer = styled.div`
  background-color: ${palette.surface};
  color: ${palette.text};
  height: 60px;
  border-bottom: 1px solid ${palette.border};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
`;

const LogoDiv = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${palette.accent};
  font-family: 'Fredoka', sans-serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
`;

// 搜索项：用一个结构体一起携带显示文本与目标 URL，避免之前两个并行数组
// (allValues / allURLs) 靠下标对应、且重名时跳转到错误项的问题。
interface SearchOption {
  label: string;
  url: string;
}

const HeadBar: React.FC = () => {
  const navigate = useNavigate();

  const allSessions = useSelector((state: RootState) => state.datafile);
  const user = useSelector((state: RootState) => state.user);

  const options: SearchOption[] = [];
  for (const session of allSessions) {
    options.push({ label: session.sessionName, url: `/sessions/${session.sessionId}` });
    for (const request of session.requests) {
      options.push({
        label: `${session.sessionName}  ›  ${request.requestName}`,
        url: `/sessions/${session.sessionId}/${request.requestId}`
      });
    }
  }

  const handleSelect = (_e: SyntheticEvent, newValue: SearchOption | null): void => {
    if (newValue) {
      navigate(newValue.url);
    }
  };

  return (
    <HeadBarContainer>
      <LogoDiv>KASKADE</LogoDiv>
      <Autocomplete
        disablePortal
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(a, b) => a.url === b.url}
        sx={{ width: 320 }}
        size="small"
        onChange={handleSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search Kaskade"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: palette.textSecondary }} />
                </InputAdornment>
              )
            }}
          />
        )}
      />
      {user ? <UserInfo username={user.username} email={user.email} /> : <SignInSignUp />}
    </HeadBarContainer>
  );
};

export default HeadBar;

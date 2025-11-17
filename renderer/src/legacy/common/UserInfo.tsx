import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { User } from '../model';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setOpenProfile } from '../redux/dataSlice';
import store from '../redux/store';

const UserInfo: React.FC<User> = ({ username }) => {
  const user = useSelector((state: RootState) => state.user);
  const openProfile = useSelector((state: RootState) => state.openProfile);

  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? username ?? '',
    password: ''
  });
  const [isUsernameEditable, setIsUsernameEditable] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isUsernameEditable) {
      setProfileForm((prev) => ({
        ...prev,
        username: user?.username ?? username ?? ''
      }));
    }
  }, [user, username, isUsernameEditable]);

  const handleOpenProfile = (): void => {
    store.dispatch(setOpenProfile(true));
  };

  const handleCloseProfile = (): void => {
    store.dispatch(setOpenProfile(false));
    setIsUsernameEditable(false);
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleUsernameEditable = (): void => {
    setIsUsernameEditable((prev) => !prev);
    setTimeout(() => usernameInputRef.current?.focus(), 0);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }}>
      <Typography variant="body1">Hello, {username}</Typography>
      <Link
        component="button"
        type="button"
        variant="body1"
        underline="hover"
        onClick={handleOpenProfile}
        sx={{ p: 0, alignSelf: 'center' }}
      >
        Profile
      </Link>

      <Dialog open={openProfile} onClose={handleCloseProfile} maxWidth="sm" fullWidth>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                name="username"
                label="Username"
                fullWidth
                value={profileForm.username}
                onChange={handleProfileInputChange}
                disabled={!isUsernameEditable}
                inputRef={usernameInputRef}
              />
              <Tooltip title={isUsernameEditable ? '锁定' : '编辑'}>
                <IconButton
                  color={isUsernameEditable ? 'success' : 'default'}
                  onClick={toggleUsernameEditable}
                  size="small"
                >
                  {isUsernameEditable ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={profileForm.password}
              onChange={handleProfileInputChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfile}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default UserInfo;

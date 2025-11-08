import React, { useState } from 'react';
import store from '../redux/store';
import { useSelector } from 'react-redux';
import { setSignupError, setOpenSignUp, setSignupLoading, setSignupFormData } from '../redux/dataSlice';
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { RootState } from '../redux/store';

const SignInSignUp: React.FC = () => {
  const openSignUp = useSelector((state: RootState) => state.openSignUp);
  const signupError = useSelector((state: RootState) => state.signupError);

  const signupFormData = useSelector((state: RootState) => state.signupFormData);
  const signupLoading = useSelector((state: RootState) => state.signupLoading);

  const handleOpenSignUp = (): void => {
    store.dispatch(setOpenSignUp(true));
    store.dispatch(setSignupError(null));
    store.dispatch(setSignupFormData({ username: '', email: '', password: '' }));
  };

  const handleCloseSignUp = (): void => {
    store.dispatch(setOpenSignUp(false));
    store.dispatch(setSignupError(null));
    store.dispatch(setSignupFormData({ username: '', email: '', password: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    store.dispatch(setSignupFormData({ ...signupFormData, [name]: value }));
  };

  const handleSignUp = async (): Promise<void> => {
    store.dispatch(setSignupError(null));
    store.dispatch(setSignupLoading(true));

    try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupFormData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '注册失败');
      }

      // 注册成功
      console.log('注册成功:', result);
      handleCloseSignUp();
      // 可以在这里添加成功提示或自动登录逻辑
    } catch (err) {
      store.dispatch(setSignupError(err instanceof Error ? err.message : '注册失败，请重试'));
    } finally {
      store.dispatch(setSignupLoading(false));
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }}>
        <Button variant="contained" color="primary" onClick={handleOpenSignUp}>
          Sign Up
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={async () => {
            const response = await fetch('http://localhost:8080/users');
            const result = await response.json();
            console.log(result);
          }}
        >
          Sign In
        </Button>
      </Stack>

      <Dialog open={openSignUp} onClose={handleCloseSignUp} maxWidth="sm" fullWidth>
        <DialogTitle>注册账户</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {signupError && <Alert severity="error">{signupError}</Alert>}
            <TextField
              name="username"
              label="用户名"
              fullWidth
              value={signupFormData.username}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="email"
              label="邮箱"
              type="email"
              fullWidth
              value={signupFormData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="password"
              label="密码"
              type="password"
              fullWidth
              value={signupFormData.password}
              onChange={handleInputChange}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSignUp}>取消</Button>
          <Button
            onClick={handleSignUp}
            variant="contained"
            disabled={
              signupLoading ||
              !signupFormData.username ||
              !signupFormData.email ||
              !signupFormData.password
            }
          >
            {signupLoading ? '注册中...' : '注册'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SignInSignUp;

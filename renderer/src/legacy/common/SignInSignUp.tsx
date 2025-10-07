import React from 'react';
import { Button, Stack } from '@mui/material';
const SignInSignUp: React.FC = () => {
  return (
    <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }}>
      <Button variant="contained" color="primary">
        Sign Up
      </Button>
      <Button
        variant="outlined"
        color="secondary"
      // onClick={() => {
      //   navigate('/result/' + sessionId + '/' + 1660926192826);
      // }}
      >
        Sign In
      </Button>
    </Stack>
  );
};

export default SignInSignUp;

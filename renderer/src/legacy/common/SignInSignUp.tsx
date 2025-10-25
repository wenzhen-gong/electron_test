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
        onClick={async () => {
          const response = await fetch('http://localhost:8080/users');
          const result = await response.json();
          console.log(result)
        }}
      >
        Sign In
      </Button>
    </Stack>
  );
};

export default SignInSignUp;

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
        onClick={() => {
          fetch('localhost:8080/users/')
            .then(response => response.json()) // Parse the JSON response
            .then(data => console.log(data))
            .catch(error => console.error('Error fetching data:', error));;
        }}
      >
        Sign In
      </Button>
    </Stack>
  );
};

export default SignInSignUp;

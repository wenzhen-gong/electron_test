import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const AuthorizationTab: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        gap: 1.5,
        py: 8
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      <Typography variant="subtitle1">Authorization</Typography>
      <Typography variant="body2" sx={{ maxWidth: 360, textAlign: 'center' }}>
        Configure authentication for this session here. This section is coming soon.
      </Typography>
    </Box>
  );
};

export default AuthorizationTab;

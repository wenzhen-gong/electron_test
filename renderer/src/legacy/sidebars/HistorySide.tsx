import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const HistorySide: React.FC = () => {
  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', letterSpacing: 0.5 }}>
        HISTORY
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
        Past benchmark runs will appear here.
      </Typography>
    </Box>
  );
};

export default HistorySide;

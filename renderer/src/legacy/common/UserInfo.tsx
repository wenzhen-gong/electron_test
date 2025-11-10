import { Stack, Typography } from '@mui/material';
import { User } from '../model';
// eslint-disable-next-line react/prop-types
const UserInfo: React.FC<User> = ({ username, email }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto' }}>
      <Typography variant="body1">Hello, {username}</Typography>
      <Typography variant="body1">Profile</Typography>
    </Stack>
  );
};

export default UserInfo;

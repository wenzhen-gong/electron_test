import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  currentSessionConfig,
  addRequest,
  duplicateSession,
  deleteSession,
  renameSession
} from '../redux/dataSlice.js';
import RequestItem from './RequestItem';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Session } from '../model';

const options = ['Add Request', 'Duplicate Session', 'Rename Session', 'Delete Session'];

interface SessionItemProps {
  session: Session;
}

const SessionItem: React.FC<SessionItemProps> = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // The id of this specific session (NOT the currently selected one).
  // 之前的实现把菜单操作绑定到 URL 里的 selectedSessionId，导致在非选中
  // session 上点菜单会误操作到另一个 session。这里统一使用本组件自己的 session。
  const thisSessionId = props.session.sessionId;

  // Decide what is the currently "selected" session.
  const params = useParams();
  const selectedSessionId = Number(params.id);
  const isSelected = selectedSessionId === thisSessionId;

  // 选中 session 时同步 configFile，供 HeadBar 搜索等使用；必须在 effect 里 dispatch，
  // 不能在 render 中调用，否则会触发 “Cannot update HeadBar while rendering SessionItem”。
  useEffect(() => {
    if (isSelected && !params.requestId) {
      dispatch(currentSessionConfig(props.session));
    }
  }, [isSelected, params.requestId, props.session, dispatch]);

  const requests: React.ReactNode[] = [];
  if (isSelected) {
    for (let i = 0; i < props.session.requests.length; ++i) {
      requests.push(
        <RequestItem
          key={props.session.requests[i].requestId}
          request={props.session.requests[i]}
          sessionId={thisSessionId}
          requestId={props.session.requests[i].requestId}
        />
      );
    }
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 重命名对话框状态。注意：Electron 默认不支持 window.prompt，会直接返回 null，
  // 所以这里用 MUI Dialog 来收集新名字，而不是浏览器原生弹窗。
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(props.session.sessionName);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleConfirmRename = (): void => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      dispatch(renameSession({ sessionId: thisSessionId, newName: trimmed }));
    }
    setRenameOpen(false);
  };

  const handleClose = (option: string): void => {
    if (option === 'Add Request') {
      dispatch(addRequest({ sessionId: thisSessionId }));
      navigate('/sessions/' + thisSessionId);
    } else if (option === 'Duplicate Session') {
      dispatch(duplicateSession({ session: props.session }));
    } else if (option === 'Rename Session') {
      setRenameValue(props.session.sessionName);
      setRenameOpen(true);
    } else if (option === 'Delete Session') {
      const confirmed = window.confirm(`Delete session "${props.session.sessionName}"?`);
      if (confirmed) {
        dispatch(deleteSession({ sessionId: thisSessionId }));
        // If we deleted the session we're currently viewing, go back to the list.
        if (isSelected) {
          navigate('/sessions');
        }
      }
    }
    setAnchorEl(null);
  };

  return (
    <Box>
      <ListItemButton
        selected={isSelected && !params.requestId}
        onClick={() => {
          navigate('/sessions/' + thisSessionId);
        }}
        sx={{ borderRadius: 1.5, py: 0.75, pr: 0.5 }}
      >
        <ListItemText
          primary={props.session.sessionName}
          primaryTypographyProps={{
            noWrap: true,
            fontWeight: isSelected ? 600 : 500,
            fontSize: 14
          }}
        />
        <IconButton
          aria-label="session actions"
          aria-controls={open ? 'session-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          size="small"
          onClick={handleClick}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          id="session-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
          slotProps={{ paper: { style: { width: '22ch' } } }}
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              onClick={() => {
                handleClose(option);
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </ListItemButton>
      <Collapse in={isSelected} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 0.5 }}>{requests}</Box>
      </Collapse>

      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Rename Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            label="Session name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmRename();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmRename} disabled={!renameValue.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionItem;

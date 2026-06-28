import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { deleteRequest } from '../redux/dataSlice';
import { Request } from '../model';

interface RequestItemProps {
  request: Request;
  sessionId: number;
  requestId: number;
}

// HTTP method -> accent color.
const httpMethodToColor: Record<string, string> = {
  GET: 'rgb(108, 221, 153)',
  POST: 'rgb(255, 228, 126)',
  PUT: 'rgb(116, 174, 246)',
  PATCH: 'rgb(192, 168, 225)',
  DELETE: 'rgb(247, 154, 143)'
};

const RequestItem: React.FC<RequestItemProps> = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const isSelected = params.requestId === props.requestId.toString();
  const methodColor = httpMethodToColor[props.request.method] ?? 'text.secondary';

  const [showDelete, setShowDelete] = useState<boolean>(false);

  return (
    <ListItemButton
      selected={isSelected}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      onClick={() => {
        navigate(`/sessions/${props.sessionId}/${props.requestId}`, {
          state: { request: props.request }
        });
      }}
      sx={{
        ml: 2,
        borderRadius: 1.5,
        py: 0.5,
        pr: 0.5,
        gap: 1
      }}
    >
      <Typography
        component="span"
        sx={{ width: 52, flexShrink: 0, fontWeight: 700, fontSize: 12, color: methodColor }}
      >
        {props.request.method}
      </Typography>
      <Box
        component="span"
        sx={{
          flexGrow: 1,
          fontSize: 13,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {props.request.requestName}
      </Box>
      <IconButton
        aria-label="delete request"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          dispatch(
            deleteRequest({
              sessionId: props.sessionId,
              requestId: props.request.requestId
            })
          );
        }}
        sx={{
          visibility: showDelete ? 'visible' : 'hidden',
          color: 'text.secondary',
          p: 0.25
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </ListItemButton>
  );
};

export default RequestItem;

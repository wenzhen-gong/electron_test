import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { palette } from '../theme';

const SUGGESTED_QUESTIONS = [
  'loadtester 是怎么被调用的？',
  'Session 数据存在哪里？',
  'benchmark 结果如何保存和查看？',
  'Run 压测前为什么要登录？'
];

const ChatSide: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectQuestion = (question: string): void => {
    navigate(`/chat?q=${encodeURIComponent(question)}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SmartToyOutlinedIcon sx={{ color: palette.accent }} />
        <Typography variant="subtitle1" fontWeight={600}>
          Code Assistant
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        基于 frontend + backend 代码库回答问题（当前为 mock 模式）。
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        试试这些问题
      </Typography>

      <Stack spacing={1}>
        {SUGGESTED_QUESTIONS.map((question) => (
          <Box
            key={question}
            component="button"
            type="button"
            onClick={() => handleSelectQuestion(question)}
            sx={{
              textAlign: 'left',
              border: `1px solid ${palette.border}`,
              borderRadius: 1.5,
              backgroundColor: palette.surfaceRaised,
              color: palette.text,
              p: 1.25,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: 1.4,
              '&:hover': {
                borderColor: palette.borderStrong,
                backgroundColor: 'rgba(113, 170, 255, 0.08)'
              }
            }}
          >
            {question}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ChatSide;

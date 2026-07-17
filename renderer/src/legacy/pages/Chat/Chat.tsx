import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { sendChatMessage } from '../../api/chat';
import type { ChatAction, ChatMessage } from '../../model/chat';
import type { Request, RunTabConfig } from '../../model';
import { createSessionFromChat } from '../../redux/dataSlice';
import store, { AppDispatch } from '../../redux/store';
import { palette } from '../../theme';

const createMessageId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function applyChatActions(actions: ChatAction[] | undefined, dispatch: AppDispatch): number | null {
  if (!actions?.length) {
    return null;
  }

  let createdSessionId: number | null = null;
  for (const action of actions) {
    if (action.type !== 'create_session') {
      continue;
    }
    const p = action.payload || {};
    const method = (p.method || 'GET').toUpperCase() as Request['method'];
    const runTabConfig: RunTabConfig = {
      mode: p.mode === 'rate' ? 'rate' : 'concurrency'
    };
    if (p.serverUrl) {
      runTabConfig.serverUrl = p.serverUrl;
    }
    if (typeof p.concurrencyNumber === 'number' && p.concurrencyNumber > 0) {
      runTabConfig.concurrencyNumber = p.concurrencyNumber;
    }
    if (typeof p.totalRequests === 'number' && p.totalRequests > 0) {
      runTabConfig.totalRequests = p.totalRequests;
    }
    if (typeof p.testDuration === 'number' && p.testDuration > 0) {
      runTabConfig.testDuration = p.testDuration;
    }
    if (typeof p.requestsPerSecond === 'number' && p.requestsPerSecond > 0) {
      runTabConfig.requestsPerSecond = p.requestsPerSecond;
    }

    dispatch(
      createSessionFromChat({
        sessionName: p.sessionName,
        requestName: p.requestName,
        method,
        url: p.url || '',
        runTabConfig
      })
    );
    createdSessionId = store.getState().pendingSessionBootstrap?.sessionId ?? null;
  }
  return createdSessionId;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastProcessedQueryRef = useRef<string | null>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const submitQuestion = useCallback(
    async (question: string): Promise<void> => {
      const trimmed = question.trim();
      if (!trimmed || loading) {
        return;
      }

      setError(null);
      setInput('');

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now()
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setLoading(true);

      try {
        const history = nextMessages.map(({ role, content }) => ({ role, content }));
        const response = await sendChatMessage({
          question: trimmed,
          history: history.slice(0, -1)
        });

        const createdSessionId = applyChatActions(response.actions, dispatch);

        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: response.answer,
          citations: response.citations,
          actions: response.actions,
          createdAt: Date.now()
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (createdSessionId) {
          navigate(`/sessions/${createdSessionId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, messages, dispatch, navigate]
  );

  useEffect(() => {
    const questionFromUrl = searchParams.get('q')?.trim();
    if (!questionFromUrl) {
      lastProcessedQueryRef.current = null;
      return;
    }
    if (lastProcessedQueryRef.current === questionFromUrl) {
      return;
    }

    lastProcessedQueryRef.current = questionFromUrl;
    setSearchParams({}, { replace: true });
    void submitQuestion(questionFromUrl);
  }, [searchParams, setSearchParams, submitQuestion]);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    void submitQuestion(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion(input);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${palette.border}`,
          backgroundColor: palette.surfaceRaised
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SmartToyOutlinedIcon sx={{ color: palette.accent }} />
          <Typography variant="h6">Assistant</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          询问代码实现，或用自然语言创建压测 Session（URL / 并发 / 请求数 / 时长）。
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.length === 0 && !loading && (
          <Box
            sx={{
              m: 'auto',
              textAlign: 'center',
              color: palette.textSecondary,
              maxWidth: 420
            }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              有什么想了解的？
            </Typography>
            <Typography variant="body2">
              例如：url 是 https://httpbin.org/get，10 个 concurrency，一共 100 个 request，duration
              不超过 3 分钟。
            </Typography>
          </Box>
        )}

        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <Stack
              key={message.id}
              direction="row"
              spacing={1.5}
              justifyContent={isUser ? 'flex-end' : 'flex-start'}
              alignItems="flex-start"
            >
              {!isUser && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(113, 170, 255, 0.16)',
                    flexShrink: 0
                  }}
                >
                  <SmartToyOutlinedIcon sx={{ fontSize: 18, color: palette.accent }} />
                </Box>
              )}

              <Paper
                elevation={0}
                sx={{
                  maxWidth: '72%',
                  px: 2,
                  py: 1.5,
                  backgroundColor: isUser ? 'rgba(113, 170, 255, 0.18)' : palette.surfaceRaised,
                  border: `1px solid ${isUser ? 'rgba(113, 170, 255, 0.35)' : palette.border}`,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body2">{message.content}</Typography>

                {message.actions && message.actions.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
                    {message.actions.map((action, idx) => (
                      <Chip
                        key={`${action.type}-${idx}`}
                        label={action.type === 'create_session' ? '已创建 Session' : action.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}

                {message.citations && message.citations.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
                    {message.citations.map((citation) => {
                      const label = citation.startLine
                        ? `${citation.filePath}:${citation.startLine}`
                        : citation.filePath;
                      return (
                        <Chip
                          key={`${citation.repo}-${label}`}
                          label={`${citation.repo} · ${label}`}
                          size="small"
                          variant="outlined"
                        />
                      );
                    })}
                  </Stack>
                )}
              </Paper>

              {isUser && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    flexShrink: 0
                  }}
                >
                  <PersonOutlineIcon sx={{ fontSize: 18 }} />
                </Box>
              )}
            </Stack>
          );
        })}

        {loading && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              正在思考并准备操作…
            </Typography>
          </Stack>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {error && (
        <Box sx={{ px: 3, pb: 1 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${palette.border}`,
          backgroundColor: palette.surfaceRaised
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            placeholder="输入问题，Enter 发送，Shift+Enter 换行"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={loading || !input.trim()}
            sx={{
              width: 44,
              height: 44,
              backgroundColor: 'rgba(113, 170, 255, 0.16)',
              '&:hover': { backgroundColor: 'rgba(113, 170, 255, 0.28)' }
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default Chat;

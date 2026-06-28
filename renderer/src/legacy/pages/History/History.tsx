import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import Paper from '@mui/material/Paper';
import HistoryIcon from '@mui/icons-material/Restore';
import { ResultMetadata, Result } from '../../model';
import { setResult } from '../../redux/dataSlice';
import { RootState } from '../../redux/store';
import { apiUrl } from '../../config';
import {
  getSuccessRatioColor,
  getP50LatencyColor,
  getP95LatencyColor
} from '../../common/resultMetrics';

// 全局历史页面：只按当前登录用户(userId)查询，列出该用户在所有 session 下跑过的
// benchmark 记录。区别于 session 内的 HistoryTab（额外按 session_id 过滤），这里
// 不限制 session，所以即使本地 session 列表被重建、id 变了，也能看到全部历史。
const History: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const datafile = useSelector((state: RootState) => state.datafile);

  const [results, setResults] = useState<ResultMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 把 sessionId 映射成本地的 session 名称（若该 session 仍存在），否则回退到原始 id。
  const sessionNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const session of datafile) {
      map.set(session.sessionId.toString(), session.sessionName);
    }
    return map;
  }, [datafile]);

  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!user) {
      setError('Please log in to view benchmark history');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const limit = 100;
      const response = await fetch(
        apiUrl(`/benchmarkresult?userId=${user.id}&limit=${limit}`),
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch benchmark history');
      }

      const data: ResultMetadata[] = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 点击某条记录：拉取完整结果写入 Redux，再跳到对应 session 的 Result 标签页。
  // Sessions 页会在检测到 state.result 后自动切到 Result(index 3)。
  const handleRowClick = async (resultId: number, sessionId: string): Promise<void> => {
    try {
      const response = await fetch(apiUrl(`/benchmarkresult/${resultId}`), {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch benchmark result details');
      }

      const data = await response.json();
      const result: Result =
        typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      const resultMetadata: ResultMetadata = {
        id: data.id,
        userId: data.user_id,
        timestamp: data.timestamp,
        sessionId: data.session_id,
        version: data.version,
        successRatio: data.success_ratio,
        p50Latency: data.p50_latency,
        p95Latency: data.p95_latency,
        throughput: data.throughput
      };

      dispatch(setResult({ result, resultMetadata }));
      navigate('/sessions/' + sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          gap: 1.5,
          p: 6
        }}
      >
        <HistoryIcon sx={{ fontSize: 56, opacity: 0.5 }} />
        <Typography variant="h6">No history yet</Typography>
        <Typography variant="body2" sx={{ maxWidth: 360, textAlign: 'center' }}>
          Open a session and run a test to start collecting results. Past runs across all sessions
          will show up here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Benchmark History
      </Typography>
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Session</strong>
              </TableCell>
              <TableCell>
                <strong>Timestamp</strong>
              </TableCell>
              <TableCell>
                <strong>Version</strong>
              </TableCell>
              <TableCell sx={{ padding: '8px 6px' }}>
                <strong>Success Ratio</strong>
              </TableCell>
              <TableCell sx={{ padding: '8px 6px' }}>
                <strong>P50 Latency</strong>
              </TableCell>
              <TableCell sx={{ padding: '8px 6px' }}>
                <strong>P95 Latency</strong>
              </TableCell>
              <TableCell sx={{ padding: '8px 6px' }}>
                <strong>Throughput</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow
                key={result.id}
                hover
                onClick={() => handleRowClick(result.id, result.sessionId)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{result.id}</TableCell>
                <TableCell>
                  {sessionNameById.get(result.sessionId) ?? result.sessionId}
                </TableCell>
                <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                <TableCell>{result.version}</TableCell>
                <TableCell sx={{ padding: '8px 6px' }}>
                  <Chip
                    label={result.successRatio >= 0 ? `${result.successRatio.toFixed(1)}%` : 'N/A'}
                    size="small"
                    color={getSuccessRatioColor(result.successRatio)}
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px 6px' }}>
                  <Chip
                    label={result.p50Latency >= 0 ? `${result.p50Latency.toFixed(0)}ms` : 'N/A'}
                    size="small"
                    color={getP50LatencyColor(result.p50Latency)}
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px 6px' }}>
                  <Chip
                    label={result.p95Latency >= 0 ? `${result.p95Latency.toFixed(0)}ms` : 'N/A'}
                    size="small"
                    color={getP95LatencyColor(result.p95Latency)}
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px 6px' }}>
                  <Chip
                    label={result.throughput >= 0 ? `${result.throughput.toFixed(1)}/s` : 'N/A'}
                    size="small"
                    color="default"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default History;

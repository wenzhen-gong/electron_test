import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material';
import Paper from '@mui/material/Paper';
import { ResultMetadata } from '../../../model';

interface HistoryTabProps {
  // Add props if needed
}

const HistoryTab: React.FC<HistoryTabProps> = () => {
  const params = useParams();
  const sessionId = params.id;
  const [results, setResults] = useState<ResultMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!sessionId) {
      setError('Session ID not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const limit = 20; // Show last 20 results
      const response = await fetch(
        `http://localhost:8080/benchmarkresult?sessionId=${sessionId}&limit=${limit}`
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
  }, [sessionId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                <strong>Timestamp</strong>
              </TableCell>
              <TableCell>
                <strong>Version</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No benchmark results found for this session.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((result) => (
                <TableRow key={result.id} hover>
                  <TableCell>{result.id}</TableCell>
                  <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{result.version}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistoryTab;

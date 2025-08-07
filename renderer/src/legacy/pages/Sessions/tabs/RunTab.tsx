import React, { useState, useEffect } from 'react';
import store from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  setValidUserInput,
  setRunTabData,
  runTest,
  resetRunTabConfig
} from '../../../redux/dataSlice';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Typography
} from '@mui/material';

const RunTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const sessionId = params.id;

  const runTabConfig = useSelector((state) => state.runTabConfig);
  const validUserInput = useSelector((state) => state.validUserInput);

  useEffect(() => {
    return () => {
      // console.log('Resetting runTabConfig and validUserInput');
      store.dispatch(resetRunTabConfig());
    };
  }, []);

  useEffect(() => {
    // console.log('Checking if user input is valid');
    if (validUserInput.valid) {
      store.dispatch(runTest());
    }
  }, [validUserInput.valid]);

  // console.log('upon rendering, validUserInput & runTabConfig is: ', validUserInput, runTabConfig);
  // local states to manage input values, would be redundant to manage centrally...
  const [httpMethod, setHttpMethod] = useState('');
  const [URL, setURL] = useState('');
  const [testDuration, setTestDuration] = useState(0);
  const [concurrencyNumber, setConcurrencyNumber] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [reqBody, setReqBody] = useState('');
  const [contentType, setContentType] = useState('');

  // use setRunTabData reducer to manage runTabConfig state centrally
  const handleInputChange = (inputName, inputValue) => {
    const config = { ...runTabConfig };
    if (
      inputName === 'URL' ||
      inputName === 'httpMethod' ||
      inputName === 'reqBody' ||
      inputName === 'contentType'
    ) {
      config[inputName] = inputValue;
    } else {
      config[inputName] = parseInt(inputValue);
    }
    store.dispatch(setRunTabData(config));
  };

  const validateUserInput = () => {
    // 校验 httpMethod
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (
      typeof runTabConfig.httpMethod !== 'string' ||
      !allowedMethods.includes(runTabConfig.httpMethod.toUpperCase())
    ) {
      store.dispatch(
        setValidUserInput({
          valid: false,
          error: 'httpMethod must be one of GET, POST, PUT, DELETE'
        })
      );
      return;
    }

    // 校验 URL
    if (
      typeof runTabConfig.URL !== 'string' ||
      !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(runTabConfig.URL)
    ) {
      store.dispatch(setValidUserInput({ valid: false, error: 'URL must be a valid string URL' }));
      return;
    }
    // 校验必须为正整数的字段
    const positiveIntegerFields = ['testDuration', 'concurrencyNumber', 'totalRequests'];
    for (const field of positiveIntegerFields) {
      if (!Number.isInteger(runTabConfig[field]) || runTabConfig[field] <= 0) {
        store.dispatch(
          setValidUserInput({ valid: false, error: `${field} must be a positive integer` })
        );
        return;
      }
    }

    // 如果所有检查通过
    store.dispatch(setValidUserInput({ valid: true }));
    return;
  };

  return (
    <Box display={'flex'}>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '300px', // 统一宽度
          marginLeft: '20px' // ⬅️ 靠左，距离左边 20px
        }}
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel id="method-label">HTTP Method</InputLabel>
          <Select
            labelId="method-label"
            value={httpMethod}
            onChange={(e) => {
              setHttpMethod(e.target.value);
              handleInputChange('httpMethod', e.target.value);
            }}
            input={<OutlinedInput label="HTTP Method" />}
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="URL"
          variant="outlined"
          value={URL}
          onChange={(e) => {
            setURL(e.target.value);
            handleInputChange('URL', e.target.value);
          }}
          fullWidth
        />

        <TextField
          label="Test Duration"
          type="number"
          variant="outlined"
          value={testDuration}
          onChange={(e) => {
            setTestDuration(e.target.value);
            handleInputChange('testDuration', e.target.value);
          }}
          fullWidth
        />

        <TextField
          label="Concurrency Number"
          type="number"
          variant="outlined"
          value={concurrencyNumber}
          onChange={(e) => {
            setConcurrencyNumber(e.target.value);
            handleInputChange('concurrencyNumber', e.target.value);
          }}
          fullWidth
        />

        <TextField
          label="Total Requests"
          type="number"
          variant="outlined"
          value={totalRequests}
          onChange={(e) => {
            setTotalRequests(e.target.value);
            handleInputChange('totalRequests', e.target.value);
          }}
          fullWidth
        />
        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }} justifyContent="flex-start">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              validateUserInput();
              console.log('after clicking: ', validUserInput.valid);
            }}
          >
            Run
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              navigate('/result/' + sessionId + '/' + 1660926192826);
            }}
          >
            Result
          </Button>
        </Stack>
        {validUserInput.error && (
          <Typography
            variant="body2"
            sx={{ color: 'error.main', marginTop: 1, marginLeft: '20px' }}
          >
            {validUserInput.error}
          </Typography>
        )}
      </Box>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '300px', // 统一宽度
          marginLeft: '20px' // ⬅️ 靠左，距离左边 20px
        }}
      >
        <TextField
          label="Request Body"
          variant="outlined"
          value={reqBody}
          onChange={(e) => {
            setReqBody(e.target.value);
            handleInputChange('reqBody', e.target.value);
          }}
          fullWidth
        />
      </Box>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '300px', // 统一宽度
          marginLeft: '20px' // ⬅️ 靠左，距离左边 20px
        }}
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel id="method-label">Content Type</InputLabel>
          <Select
            labelId="method-label"
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value);
              handleInputChange('contentType', e.target.value);
            }}
            input={<OutlinedInput label="Content Type" />}
          >
            <MenuItem value="JSON">JSON</MenuItem>
            <MenuItem value="Text">Text</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default RunTab;

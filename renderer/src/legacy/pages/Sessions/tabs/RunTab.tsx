import React, { useState, useEffect } from 'react';
import store from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  setValidUserInput,
  setRunTabData,
  setHeaders,
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
  Typography,
  Grid
} from '@mui/material';

const RunTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const sessionId = params.id;

  const runTabConfig = useSelector((state) => state.runTabConfig);
  const validUserInput = useSelector((state) => state.validUserInput);
  const headers = useSelector((state) => state.headers);
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
  }, [validUserInput.valid, validUserInput.flag]);

  // const [headers, setHeaders] = useState([]);
  const [contentType, setContentType] = useState('');
  // console.log('upon rendering, headers is: ', headers, headers.length);

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
      config[inputName] = Number(inputValue);
    }
    store.dispatch(setRunTabData(config));
  };

  const handleHeaderChange = (e, field, index) => {
    // console.log(index, e.target.value)
    // const index = parseInt(e.target.dataset.index, 10);
    // const newValue = e.target.value;

    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: e.target.value };

    store.dispatch(setHeaders(updated));
  };

  const handleAddHeader = () => {
    store.dispatch(setHeaders([...headers, {}]));
  };
  const handleRemoveHeader = (index) => {
    console.log('removing index: ', index);
    store.dispatch(setHeaders(headers.filter((_, i) => i !== index)));
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
          flag: !validUserInput.flag,
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
      store.dispatch(
        setValidUserInput({
          valid: false,
          flag: !validUserInput.flag,
          error: 'URL must be a valid string URL'
        })
      );
      return;
    }
    // 校验必须为正整数的字段
    const positiveIntegerFields = ['testDuration', 'concurrencyNumber', 'totalRequests'];
    for (const field of positiveIntegerFields) {
      if (!Number.isInteger(runTabConfig[field]) || runTabConfig[field] <= 0) {
        store.dispatch(
          setValidUserInput({
            valid: false,
            flag: !validUserInput.flag,
            error: `${field} must be a positive integer`
          })
        );
        return;
      }
    }

    // 如果所有检查通过
    store.dispatch(
      setValidUserInput({
        valid: true,
        flag: !validUserInput.flag
      })
    );
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
            // value={httpMethod}
            onChange={(e) => {
              // setHttpMethod(e.target.value);
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
          // value={URL}
          onChange={(e) => {
            // setURL(e.target.value);
            handleInputChange('URL', e.target.value);
          }}
          fullWidth
        />

        <TextField
          label="Test Duration"
          type="number"
          variant="outlined"
          // value={testDuration}
          onChange={(e) => {
            // setTestDuration(e.target.value);
            handleInputChange('testDuration', e.target.value);
          }}
          fullWidth
        />

        <TextField
          label="Concurrency Number"
          type="number"
          variant="outlined"
          // value={concurrencyNumber}
          onChange={(e) => {
            // setConcurrencyNumber(e.target.value);
            handleInputChange('concurrencyNumber', e.target.value);
          }}
          fullWidth
        />

        <TextField
          label="Total Requests"
          type="number"
          variant="outlined"
          // value={totalRequests}
          onChange={(e) => {
            // setTotalRequests(e.target.value);
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
          // value={reqBody}
          onChange={(e) => {
            // setReqBody(e.target.value);
            handleInputChange('reqBody', e.target.value);
          }}
          fullWidth
        />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Headers
        </Typography>
        {headers.map((header, index) => (
          <Grid container spacing={2} key={index} sx={{ marginBottom: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Key"
                variant="outlined"
                fullWidth
                value={header.key}
                // data-index={index}
                onChange={(e) => handleHeaderChange(e, 'key', index)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Value"
                variant="outlined"
                fullWidth
                value={header.value}
                // data-index={index}
                onChange={(e) => handleHeaderChange(e, 'value', index)}
              />
            </Grid>
            <Button variant="outlined" onClick={() => handleRemoveHeader(index)}>
              - Remove Header
            </Button>
          </Grid>
        ))}
        <Button variant="outlined" onClick={handleAddHeader}>
          + Add Header
        </Button>

        {/* <Box display="flex" gap={1}>
          <TextField
            label="Key"
            variant="outlined"
            fullWidth
            onChange={(e) => handleInputChange('headerKey', e.target.value)}
          />
          <TextField
            label="Value"
            variant="outlined"
            fullWidth
            onChange={(e) => handleInputChange('headerValue', e.target.value)}
          />
        </Box> */}
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

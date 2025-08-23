import React, { useState, useEffect } from 'react';
import store from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  setValidUserInput,
  setRunTabData,
  setHeaders,
  setParams,
  runTest,
  resetRunTabConfig,
  setContentType
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

const RunTabTemp = () => {
  const navigate = useNavigate();
  // const params = useParams();
  // const sessionId = params.id;

  const runTabConfig = useSelector((state) => state.runTabConfig);
  const validUserInput = useSelector((state) => state.validUserInput);
  const params = useSelector((state) => state.params);

  // const contentType = useSelector((state) => state.contentType);
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

  // console.log('upon rendering, headers is: ', headers, headers.length);

  // use setRunTabData reducer to manage runTabConfig state centrally
  const handleInputChange = (inputName, inputValue) => {
    const config = { ...runTabConfig };
    if (inputName === 'httpMethod' || inputName === 'reqBody') {
      config[inputName] = inputValue;
    } else if (inputName === 'URL') {
      config[inputName] = inputValue;
      if (inputValue.indexOf('?') !== -1) {
        const paramsList = inputValue.substring(inputValue.indexOf('?') + 1).split('&');
        const stateParam = [];
        paramsList.forEach((param) => {
          if (param.indexOf('=') !== -1) {
            stateParam.push({
              key: param.substring(0, param.indexOf('=')),
              value: param.substring(param.indexOf('=') + 1)
            });
          } else {
            stateParam.push({ key: param, value: '' });
          }
        });
        store.dispatch(setParams(stateParam));
      } else {
        store.dispatch(setParams([]));
      }
    } else {
      config[inputName] = Number(inputValue);
    }
    store.dispatch(setRunTabData(config));
  };
  const updatedURL = (updated) => {
    let suffix = '?';
    updated.forEach((param) => {
      const value =
        param.value.indexOf('&') === -1
          ? param.value
          : param.value.slice(0, param.value.indexOf('&')) +
            '%26' +
            param.value.slice(param.value.indexOf('&') + 1, param.value.length);
      suffix += param.key + '=' + value + '&';
    });
    let updatedURL = runTabConfig.URL;
    updatedURL =
      updatedURL.indexOf('?') === -1
        ? updatedURL + suffix.slice(0, suffix.length - 1)
        : updatedURL.slice(0, updatedURL.indexOf('?')) + suffix.slice(0, suffix.length - 1);
    const updatedRunTabConfig = { ...runTabConfig };
    updatedRunTabConfig['URL'] = updatedURL;
    store.dispatch(setRunTabData(updatedRunTabConfig));
  };
  const handleParamChange = (e, field, index) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: e.target.value };
    store.dispatch(setParams(updated));
    updatedURL(updated);
  };
  const handleAddParam = () => {
    store.dispatch(setParams([...params, { key: '', value: '' }]));
  };
  const handleRemoveParam = (index) => {
    const updated = params.filter((_, i) => i !== index);
    store.dispatch(setParams(updated));
    updatedURL(updated);
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
        <TextField
          label="URL"
          variant="outlined"
          value={runTabConfig.URL}
          onChange={(e) => {
            handleInputChange('URL', e.target.value);
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
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Parameters
        </Typography>
        {params.map((param, index) => (
          <Grid container spacing={2} key={index} sx={{ marginBottom: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Key"
                variant="outlined"
                fullWidth
                value={param.key}
                // data-index={index}
                onChange={(e) => handleParamChange(e, 'key', index)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Value"
                variant="outlined"
                fullWidth
                value={param.value}
                // data-index={index}
                onChange={(e) => handleParamChange(e, 'value', index)}
              />
            </Grid>
            <Button variant="outlined" onClick={() => handleRemoveParam(index)}>
              - Remove A Param
            </Button>
          </Grid>
        ))}
        <Button variant="outlined" onClick={handleAddParam}>
          + Add A Parameter
        </Button>
      </Box>
    </Box>
  );
};

export default RunTabTemp;

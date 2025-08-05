import React, { useState } from 'react'
import store from '../../../redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { setRunTabData, runTest } from '../../../redux/dataSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, OutlinedInput } from '@mui/material'

const RunTab = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const sessionId = params.id

  const runTabConfig = useSelector((state) => state.runTabConfig)

  // local states to manage input values, would be redundant to manage centrally...
  const [httpMethod, setHttpMethod] = useState('')
  const [URL, setURL] = useState('')
  const [testDuration, setTestDuration] = useState(0)
  const [concurrencyNumber, setConcurrencyNumber] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)

  // use setRunTabData reducer to manage runTabConfig state centrally
  const handleInputChange = (inputName, inputValue) => {
    const config = { ...runTabConfig }
    if (inputName === 'URL') {
      config.URL = inputValue
    } else if (inputName === 'httpMethod') {
      config.httpMethod = inputValue
    } else {
      config[inputName] = parseInt(inputValue)
    }
    store.dispatch(setRunTabData(config))
  }

  return (
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
            handleInputChange("httpMethod", e.target.value);
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
          setURL(e.target.value)
          handleInputChange('URL', e.target.value)
        }}
        fullWidth
      />

      <TextField
        label="Test Duration"
        type="number"
        variant="outlined"
        value={testDuration}
        onChange={(e) => {
          setTestDuration(e.target.value)
          handleInputChange('testDuration', e.target.value)
        }}
        fullWidth
      />

      <TextField
        label="Concurrency Number"
        type="number"
        variant="outlined"
        value={concurrencyNumber}
        onChange={(e) => {
          setConcurrencyNumber(e.target.value)
          handleInputChange('concurrencyNumber', e.target.value)
        }}
        fullWidth
      />

      <TextField
        label="Total Requests"
        type="number"
        variant="outlined"
        value={totalRequests}
        onChange={(e) => {
          setTotalRequests(e.target.value)
          handleInputChange('totalRequests', e.target.value)
        }}
        fullWidth
      />
      <Stack direction="row" spacing={2} sx={{ marginTop: 2 }} justifyContent="flex-start">
        <Button variant="contained" color="primary" onClick={() => dispatch(runTest())}>
          Run
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            navigate('/result/' + sessionId + '/' + 1660926192826)
          }}
        >
          Result
        </Button>
      </Stack>
    </Box>
  )
}

export default RunTab

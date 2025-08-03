import React, { useState } from 'react'
import store from '../../../redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { setDemoData, setRunTabData } from '../../../redux/dataSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Stack } from '@mui/material'

const RunTab = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const sessionId = params.id

  const runTabConfig = useSelector((state) => state.data.runTabConfig)

  // local states to manage input values, would be redundant to manage centrally...
  const [URL, setURL] = useState('')
  const [testDuration, setTestDuration] = useState(0)
  const [concurrencyNumber, setConcurrencyNumber] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)

  // use setRunTabData reducer to manage runTabConfig state centrally
  const handleInputChange = (inputName, inputValue) => {
    const config = { ...runTabConfig }
    if (inputName === 'URL') {
      config.URL = inputValue
    } else {
      config[inputName] = parseInt(inputValue)
    }
    store.dispatch(setRunTabData(config))
  }


  const handleRunButton = async () => {

    console.log('runTabConfig before Run: ', runTabConfig)
    // const result = await window.electronAPI.kaskadestart(updatedConfig);
    const result = await window.api.runLoadTest(runTabConfig)
    console.log(result)
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
        label="ConcurrencyNumber Number"
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
        <Button variant="contained" color="primary" onClick={handleRunButton}>
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

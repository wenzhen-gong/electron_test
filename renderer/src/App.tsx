// renderer/src/App.tsx
import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [concurrency, setConcurrency] = useState(5)
  const [count, setCount] = useState(10)
  const [result, setResult] = useState<any>(null)

  const runTest = async () => {
    const config = {
      url,
      concurrency,
      count,
      method: 'GET',
      payload: '',
      headers: {}
    }
    const res = await window.api.runLoadTest(config)
    setResult(res)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Server Load Tester</h1>
      <h1 class="text-3xl font-bold underline text-blue-500">
        Tailwind v4 is working!
      </h1>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Target URL" className="border p-2 w-full mb-4" />
      <input type="number" value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} placeholder="Concurrency" className="border p-2 w-full mb-4" />
      <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} placeholder="Total Requests" className="border p-2 w-full mb-4" />
      <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} placeholder="key value" className="border p-2 w-full mb-4" />
      <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} placeholder="key value" className="border p-2 w-full mb-4" />
      <button onClick={runTest} className="bg-blue-500 text-white px-4 py-2">Start Test</button>

      {result && (
        <div className="mt-6">
          <p>✅ Success: {result.success}</p>
          <p>❌ Failures: {result.failures}</p>
          <p>⏱ Avg Response Time: {result.avgTimeMs.toFixed(2)} ms</p>
        </div>
      )}
    </div>
  );
}

export default App

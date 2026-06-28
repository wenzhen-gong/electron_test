// scripts/loadtester.go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

type Request struct {
	RequestID   int      `json:"requestId"`
	RequestName string   `json:"requestName"`
	URL         string   `json:"url"`
	Method      string   `json:"method"`
	ReqBody     string   `json:"reqBody"`
	Headers     []Header `json:"headers"`
	ContentType string   `json:"contentType"`
}

type Header struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Mode 决定负载模型：
//   - "concurrency"（默认，闭环）：固定 Concurrency 个 worker，每个发完一个立刻发下一个，
//     直到达到 Count（总请求数）或 Duration（秒）任一停止条件。
//   - "rate"（开环）：按 Rate 个/秒的固定到达速率派发请求，与是否处理完无关，持续 Duration 秒。
type Config struct {
	ServerURL   string    `json:"serverUrl"`
	Mode        string    `json:"mode"`
	Concurrency int       `json:"concurrencyNumber"`
	Count       int       `json:"totalRequests"`
	Duration    int       `json:"testDuration"`      // 秒
	Rate        int       `json:"requestsPerSecond"` // 开环模式：每秒请求数
	Requests    []Request `json:"requests"`
}

type RequestStats struct {
	RequestID        int             `json:"requestId"`
	RequestName      string          `json:"requestName"`
	AvgTimeMs        float64         `json:"avgTimeMs"`
	Success          int             `json:"success"`
	Failures         int             `json:"failures"`
	PercentileTimeMs map[int]float64 `json:"percentileTimeMs"`
}

type Result struct {
	// Session-level stats (all requests combined)
	AvgTimeMs        float64         `json:"avgTimeMs"`
	Success          int             `json:"success"`
	Failures         int             `json:"failures"`
	PercentileTimeMs map[int]float64 `json:"percentileTimeMs"`
	// 吞吐量：整个测试期间每秒完成的 HTTP 请求数（按墙钟时间计）。
	Throughput float64 `json:"throughput"`
	// Per-request stats
	RequestStats []RequestStats `json:"requestStats"`
}

// 单个请求的测量结果。
type requestResult struct {
	requestID int
	duration  time.Duration
	succeeded bool
}

// 一次 session（按顺序执行该会话内所有 request）的测量结果。
type sessionResult struct {
	duration   time.Duration
	succeeded  bool
	perRequest []requestResult
}

func buildHeaders(headers []Header, contentType string) map[string]string {
	headerMap := make(map[string]string)
	if contentType != "" {
		headerMap["Content-Type"] = contentType
	}
	for _, header := range headers {
		if header.Key != "" {
			headerMap[header.Key] = header.Value
		}
	}
	return headerMap
}

// runSession 顺序执行配置里的所有 request，测量每个请求耗时与整个 session 耗时。
// 任一请求失败则停止该 session 剩余请求（沿用原有语义）。
func runSession(client *http.Client, config *Config) sessionResult {
	sessionStart := time.Now()
	sessionSucceeded := true
	perRequest := make([]requestResult, 0, len(config.Requests))

	for _, request := range config.Requests {
		// 拼接完整 URL（params 已经包含在 request.URL 中）。
		fullURL := strings.TrimSuffix(config.ServerURL, "/")
		if request.URL != "" {
			if !strings.HasPrefix(request.URL, "/") {
				fullURL += "/"
			}
			fullURL += request.URL
		}

		headers := buildHeaders(request.Headers, request.ContentType)

		var bodyReader io.Reader
		if request.ReqBody != "" {
			bodyReader = strings.NewReader(request.ReqBody)
		}
		req, err := http.NewRequest(request.Method, fullURL, bodyReader)
		if err != nil {
			perRequest = append(perRequest, requestResult{
				requestID: request.RequestID,
				duration:  0,
				succeeded: false,
			})
			sessionSucceeded = false
			break
		}
		for k, v := range headers {
			req.Header.Set(k, v)
		}

		requestStart := time.Now()
		resp, err := client.Do(req)

		requestSucceeded := err == nil && resp != nil && resp.StatusCode < 400

		// 始终把 body 读完并关闭：一来连接才能被 keep-alive 复用，二来让单请求
		// 延迟覆盖「完整往返（含响应体下载）」，而不是只到响应头（client.Do 返回点）。
		// 因此计时终点放在读完 body 之后，使其口径与 session 整体耗时一致。
		if resp != nil && resp.Body != nil {
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
		}
		requestDuration := time.Since(requestStart)

		perRequest = append(perRequest, requestResult{
			requestID: request.RequestID,
			duration:  requestDuration,
			succeeded: requestSucceeded,
		})

		if !requestSucceeded {
			sessionSucceeded = false
			break
		}
	}

	return sessionResult{
		duration:   time.Since(sessionStart),
		succeeded:  sessionSucceeded,
		perRequest: perRequest,
	}
}

// newHTTPClient 创建一个为压测调优过的 client：带超时，连接池足够大以便复用。
func newHTTPClient(maxConns int) *http.Client {
	if maxConns < 100 {
		maxConns = 100
	}
	transport := &http.Transport{
		MaxIdleConns:        maxConns * 2,
		MaxIdleConnsPerHost: maxConns,
		IdleConnTimeout:     90 * time.Second,
	}
	return &http.Client{
		Timeout:   30 * time.Second,
		Transport: transport,
	}
}

// runClosedModel：固定 Concurrency 个 worker 持续发请求，直到达到总请求数或时长上限。
func runClosedModel(config *Config, client *http.Client, results chan<- sessionResult) {
	var dispatched int64
	var deadline time.Time
	if config.Duration > 0 {
		deadline = time.Now().Add(time.Duration(config.Duration) * time.Second)
	}

	var wg sync.WaitGroup
	for w := 0; w < config.Concurrency; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				// 按请求总数停止。
				if config.Count > 0 {
					if atomic.AddInt64(&dispatched, 1) > int64(config.Count) {
						return
					}
				}
				// 按时长停止。
				if config.Duration > 0 && time.Now().After(deadline) {
					return
				}
				results <- runSession(client, config)
			}
		}()
	}
	wg.Wait()
}

// runOpenModel：以固定到达速率派发请求（开环），持续 Duration 秒，不等待前一个完成。
func runOpenModel(config *Config, client *http.Client, results chan<- sessionResult) {
	interval := time.Second / time.Duration(config.Rate)
	if interval <= 0 {
		interval = time.Microsecond
	}
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	deadline := time.Now().Add(time.Duration(config.Duration) * time.Second)

	var wg sync.WaitGroup
	for now := range ticker.C {
		if now.After(deadline) {
			break
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			results <- runSession(client, config)
		}()
	}
	wg.Wait()
}

func computePercentiles(sortedTimes []time.Duration) map[int]float64 {
	percentiles := make(map[int]float64)
	n := len(sortedTimes)
	if n == 0 {
		return percentiles
	}
	for i := 0; i <= 100; i++ {
		var index int
		if i == 100 {
			index = n - 1
		} else {
			index = int(float64(n) * float64(i) / 100.0)
			if index >= n {
				index = n - 1
			}
		}
		percentiles[i] = sortedTimes[index].Seconds() * 1000.0
	}
	return percentiles
}

func main() {
	var config Config
	decoder := json.NewDecoder(os.Stdin)
	if err := decoder.Decode(&config); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to decode config: %v\n", err)
		os.Exit(1)
	}

	if len(config.Requests) == 0 {
		fmt.Fprintf(os.Stderr, "No requests found in config\n")
		os.Exit(1)
	}

	// 校验停止条件，避免出现无限循环。
	mode := config.Mode
	if mode == "" {
		mode = "concurrency"
	}
	if mode == "concurrency" {
		if config.Concurrency <= 0 {
			fmt.Fprintf(os.Stderr, "concurrencyNumber must be > 0\n")
			os.Exit(1)
		}
		if config.Count <= 0 && config.Duration <= 0 {
			fmt.Fprintf(os.Stderr, "either totalRequests or testDuration must be > 0\n")
			os.Exit(1)
		}
	} else if mode == "rate" {
		if config.Rate <= 0 {
			fmt.Fprintf(os.Stderr, "requestsPerSecond must be > 0\n")
			os.Exit(1)
		}
		if config.Duration <= 0 {
			fmt.Fprintf(os.Stderr, "testDuration must be > 0 for rate mode\n")
			os.Exit(1)
		}
	} else {
		fmt.Fprintf(os.Stderr, "unknown mode: %s\n", mode)
		os.Exit(1)
	}

	// 连接池大小：闭环按并发数，开环按速率估算。
	maxConns := config.Concurrency
	if mode == "rate" {
		maxConns = config.Rate
	}
	client := newHTTPClient(maxConns)

	// 用 channel + 单个收集 goroutine 聚合结果，避免每个请求都抢同一把锁。
	results := make(chan sessionResult, 1024)

	sessionTimes := make([]time.Duration, 0, 1024)
	sessionSuccess := 0
	sessionFailures := 0
	requestTimes := make(map[int][]time.Duration)
	requestSuccess := make(map[int]int)
	requestFailures := make(map[int]int)
	for _, req := range config.Requests {
		requestTimes[req.RequestID] = make([]time.Duration, 0, 1024)
	}

	collectorDone := make(chan struct{})
	go func() {
		for r := range results {
			sessionTimes = append(sessionTimes, r.duration)
			if r.succeeded {
				sessionSuccess++
			} else {
				sessionFailures++
			}
			for _, rr := range r.perRequest {
				requestTimes[rr.requestID] = append(requestTimes[rr.requestID], rr.duration)
				if rr.succeeded {
					requestSuccess[rr.requestID]++
				} else {
					requestFailures[rr.requestID]++
				}
			}
		}
		close(collectorDone)
	}()

	testStart := time.Now()
	if mode == "rate" {
		runOpenModel(&config, client, results)
	} else {
		runClosedModel(&config, client, results)
	}
	elapsed := time.Since(testStart)
	close(results)
	<-collectorDone

	// 吞吐量 = 完成的 HTTP 请求总数 / 墙钟耗时。
	totalRequests := 0
	for _, times := range requestTimes {
		totalRequests += len(times)
	}
	throughput := 0.0
	if elapsed.Seconds() > 0 {
		throughput = float64(totalRequests) / elapsed.Seconds()
	}

	// Session 级统计。
	sort.Slice(sessionTimes, func(i, j int) bool {
		return sessionTimes[i] < sessionTimes[j]
	})
	sessionPercentileTimeMs := computePercentiles(sessionTimes)

	var sessionTotal time.Duration
	for _, t := range sessionTimes {
		sessionTotal += t
	}
	sessionAvg := 0.0
	if len(sessionTimes) > 0 {
		sessionAvg = sessionTotal.Seconds() * 1000 / float64(len(sessionTimes))
	}

	// Per-request 统计。
	requestStatsList := make([]RequestStats, 0, len(config.Requests))
	for _, req := range config.Requests {
		times := requestTimes[req.RequestID]
		if len(times) == 0 {
			continue
		}
		sortedTimes := make([]time.Duration, len(times))
		copy(sortedTimes, times)
		sort.Slice(sortedTimes, func(i, j int) bool {
			return sortedTimes[i] < sortedTimes[j]
		})

		var total time.Duration
		for _, t := range times {
			total += t
		}
		avg := total.Seconds() * 1000 / float64(len(times))

		requestStatsList = append(requestStatsList, RequestStats{
			RequestID:        req.RequestID,
			RequestName:      req.RequestName,
			AvgTimeMs:        avg,
			Success:          requestSuccess[req.RequestID],
			Failures:         requestFailures[req.RequestID],
			PercentileTimeMs: computePercentiles(sortedTimes),
		})
	}

	result := Result{
		AvgTimeMs:        sessionAvg,
		Success:          sessionSuccess,
		Failures:         sessionFailures,
		PercentileTimeMs: sessionPercentileTimeMs,
		Throughput:       throughput,
		RequestStats:     requestStatsList,
	}
	json.NewEncoder(os.Stdout).Encode(result)
}

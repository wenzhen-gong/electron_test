// scripts/loadtester.go
package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

type Config struct {
	URL         string            `json:"url"`
	Concurrency int               `json:"concurrency"`
	Count       int               `json:"count"`
	Method      string            `json:"method"`
	Payload     string            `json:"payload"`
	Headers     map[string]string `json:"headers"`
}

type Result struct {
	AvgTimeMs float64 `json:"avgTimeMs"`
	Success   int     `json:"success"`
	Failures  int     `json:"failures"`
}

func main() {
	CONCURRENCY := 1
	COUNT := 1
	var wg sync.WaitGroup
	times := make([]time.Duration, COUNT)
	success := 0
	failures := 0
	var mu sync.Mutex

	sem := make(chan struct{}, CONCURRENCY)

	for i := 0; i < COUNT; i++ {
		wg.Add(1)
		sem <- struct{}{}
		go func(index int) {
			defer func() { <-sem }()
			defer wg.Done()

			body := strings.NewReader("{\"name\":\"test\"}")
			// body := strings.NewReader("a string")

			headers := map[string]string{"Content-Type": "application/json"}

			req, _ := http.NewRequest("POST", "https://httpbin.org/post", body)

			for k, v := range headers {
				req.Header.Set(k, v)
			}

			start := time.Now()
			resp, err := http.DefaultClient.Do(req)
			duration := time.Since(start)

			mu.Lock()
			times[index] = duration
			if err == nil && resp.StatusCode < 400 {
				defer resp.Body.Close()
				bodyBytes, _ := io.ReadAll(resp.Body)
				bodyStr := string(bodyBytes)
				fmt.Println(bodyStr)
				success++
			} else {
				failures++
			}
			mu.Unlock()
		}(i)
	}

	wg.Wait()

	var total time.Duration
	for _, t := range times {
		total += t
	}

	avg := total.Seconds() * 1000 / float64(10)
	result := Result{AvgTimeMs: avg, Success: success, Failures: failures}
	fmt.Println(result)
}

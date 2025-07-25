// scripts/loadtester.go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
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
	var config Config
	decoder := json.NewDecoder(os.Stdin)
	if err := decoder.Decode(&config); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to decode config: %v\n", err)
		os.Exit(1)
	}

	var wg sync.WaitGroup
	times := make([]time.Duration, config.Count)
	success := 0
	failures := 0
	var mu sync.Mutex

	sem := make(chan struct{}, config.Concurrency)

	for i := 0; i < config.Count; i++ {
		wg.Add(1)
		sem <- struct{}{}
		go func(index int) {
			defer func() { <-sem }()
			defer wg.Done()

			req, _ := http.NewRequest(config.Method, config.URL, io.NopCloser(nil))
			for k, v := range config.Headers {
				req.Header.Set(k, v)
			}

			start := time.Now()
			resp, err := http.DefaultClient.Do(req)
			duration := time.Since(start)

			mu.Lock()
			times[index] = duration
			if err == nil && resp.StatusCode < 400 {
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

	avg := total.Seconds() * 1000 / float64(config.Count)
	result := Result{AvgTimeMs: avg, Success: success, Failures: failures}
	json.NewEncoder(os.Stdout).Encode(result)
}

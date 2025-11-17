package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"kaskade_backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type addBenchmarkResultRequest struct {
	SessionID string                 `json:"sessionId" binding:"required"`
	Version   string                 `json:"version" binding:"required"`
	Config    map[string]interface{} `json:"config" binding:"required"`
	Result    map[string]interface{} `json:"result" binding:"required"`
}

func AddBenchmarkResult(c *gin.Context, db *gorm.DB) {
	var req addBenchmarkResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	configBytes, err := json.Marshal(req.Config)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid config payload"})
		return
	}

	resultBytes, err := json.Marshal(req.Result)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid result payload"})
		return
	}

	record := models.BenchmarkResult{
		SessionID: req.SessionID,
		Version:   req.Version,
		Config:    datatypes.JSON(configBytes),
		Result:    datatypes.JSON(resultBytes),
	}

	if err := db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save benchmark result"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":        record.ID,
		"timestamp": record.Timestamp,
	})
}

type benchmarkResultSummary struct {
	ID        uint      `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	SessionID string    `json:"sessionId"`
	Version   string    `json:"version"`
}

func GetBenchmarkResults(c *gin.Context, db *gorm.DB) {
	query := db.Model(&models.BenchmarkResult{})

	// ID exact match
	if idStr := c.Query("id"); idStr != "" {
		if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
			query = query.Where("id = ?", id)
		}
	}

	// ID range query
	if idMinStr := c.Query("idMin"); idMinStr != "" {
		if idMin, err := strconv.ParseUint(idMinStr, 10, 32); err == nil {
			query = query.Where("id >= ?", idMin)
		}
	}
	if idMaxStr := c.Query("idMax"); idMaxStr != "" {
		if idMax, err := strconv.ParseUint(idMaxStr, 10, 32); err == nil {
			query = query.Where("id <= ?", idMax)
		}
	}

	// SessionID exact match (optional)
	if sessionID := c.Query("sessionId"); sessionID != "" {
		query = query.Where("session_id = ?", sessionID)
	}

	// Version exact match (optional)
	if version := c.Query("version"); version != "" {
		query = query.Where("version = ?", version)
	}

	// Timestamp range query (left-closed, right-open: [min, max))
	if timestampMinStr := c.Query("timestampMin"); timestampMinStr != "" {
		if timestampMin, err := time.Parse(time.RFC3339, timestampMinStr); err == nil {
			query = query.Where("timestamp >= ?", timestampMin)
		}
	}
	if timestampMaxStr := c.Query("timestampMax"); timestampMaxStr != "" {
		if timestampMax, err := time.Parse(time.RFC3339, timestampMaxStr); err == nil {
			query = query.Where("timestamp < ?", timestampMax)
		}
	}

	// Order by timestamp descending
	query = query.Order("timestamp DESC")

	// Limit query
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			query = query.Limit(limit)
		}
	}

	var results []models.BenchmarkResult
	if err := query.Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query benchmark results"})
		return
	}

	// Convert to summary format
	summaries := make([]benchmarkResultSummary, len(results))
	for i, result := range results {
		summaries[i] = benchmarkResultSummary{
			ID:        result.ID,
			Timestamp: result.Timestamp,
			SessionID: result.SessionID,
			Version:   result.Version,
		}
	}

	c.JSON(http.StatusOK, summaries)
}

func GetBenchmarkResultByID(c *gin.Context, db *gorm.DB) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id parameter"})
		return
	}

	var result models.BenchmarkResult
	if err := db.First(&result, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "benchmark result not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query benchmark result"})
		return
	}

	c.JSON(http.StatusOK, result)
}

package controllers

import (
	"encoding/json"
	"net/http"

	"kaskade_backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type addBenchmarkResultRequest struct {
	SessionID string                 `json:"session_id" binding:"required"`
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

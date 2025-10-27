package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username     string    `gorm:"type:varchar(50);unique;not null" json:"username"`
	Email        string    `gorm:"type:varchar(100);unique;not null" json:"email"`
	PasswordHash string    `gorm:"type:text;not null" json:"-"` // 不返回密码哈希
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// 一对多：一个用户对应多条请求记录
	RequestHistories []RequestHistory `gorm:"foreignKey:UserID" json:"request_histories,omitempty"`
}

type RequestHistory struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	UserID            uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Method            string         `gorm:"type:varchar(10);not null" json:"method"`
	URL               string         `gorm:"type:text;not null" json:"url"`
	ConcurrencyNumber int            `gorm:"not null" json:"concurrency_number"`
	TestDuration      int            `gorm:"not null" json:"test_duration"`
	TotalRequests     int            `gorm:"not null" json:"total_requests"`
	RequestBody       datatypes.JSON `json:"request_body,omitempty"`
	Headers           datatypes.JSON `json:"headers,omitempty"`
	Params            datatypes.JSON `json:"params,omitempty"`
	ContentType       string         `gorm:"type:varchar(50);default:'application/json'" json:"content_type"`
	Result            datatypes.JSON `json:"result,omitempty"`
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"created_at"`

	// 外键关系
	User User `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}

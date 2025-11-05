package auth

import (
	"fmt"
	"kaskade_backend/models"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWT secret 从环境变量读取
var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

// 🔹 生成 JWT Token
func CreateJWT(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "missing user info"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.(models.User).ID,
		"exp":    time.Now().Add(time.Hour * 24).Unix(), // 1天后过期
	})
	fmt.Println(os.Getenv("JWT_SECRET"))
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	} else {
		c.Set("tokenString", tokenString)
		c.Next()
	}
}

// 🔹 验证 JWT Token
func AuthRequired(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		c.Abort()
		return
	}

	// 通常格式为 "Bearer <token>"
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)
	// 解析 token
	// token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
	// 	// 确保签名算法是预期的
	// 	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
	// 		return nil, jwt.ErrTokenMalformed
	// 	}
	// 	return jwtSecret, nil
	// })

	// if err != nil || !token.Valid {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
	// 	c.Abort()
	// 	return
	// }
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		c.Abort()
		return
	}
	// 提取用户ID
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		userID, ok := claims["userID"].(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}
		c.Set("userID", userID)
		c.Next()
	}

}

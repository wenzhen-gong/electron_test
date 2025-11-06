package routes

import (
	"kaskade_backend/auth"
	"kaskade_backend/controllers"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	r.GET("/users", func(c *gin.Context) {
		controllers.GetUsers(c, db)
	})
	r.POST("/signup", func(c *gin.Context) {
		controllers.CreateUser(c, db)
	})
	r.POST("/login", func(c *gin.Context) {
		controllers.GetUser(c, db)
	}, auth.CreateJWT, func(c *gin.Context) {
		user, userExists := c.Get("user")
		tokenString, tokenStringExists := c.Get("tokenString")

		if !userExists || !tokenStringExists {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "user or token lost"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"user": user, "tokenString": tokenString})

	})
	r.PUT("/users/:username", auth.AuthRequired, func(c *gin.Context) {
		controllers.UpdateUser(c, db)
	})
	r.DELETE("/users/:username", auth.AuthRequired, func(c *gin.Context) {
		controllers.DeleteUser(c, db)
	})
}

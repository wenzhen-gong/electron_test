package routes

import (
	"kaskade_backend/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	r.GET("/users", func(c *gin.Context) {
		controllers.GetUsers(c, db)
	})
	r.POST("/users", func(c *gin.Context) {
		controllers.CreateUser(c, db)
	})
	// r.GET("/users/:id", controllers.GetUser)
	// r.PUT("/users/:id", controllers.UpdateUser)
	// r.DELETE("/users/:id", controllers.DeleteUser)
}

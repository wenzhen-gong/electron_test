package main

import (
	"gin2025/config"
	"gin2025/routes"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	port := os.Getenv("PORT")
	// Connect to db
	config.ConnectDatabase()
	// Create router using gin
	r := gin.Default()
	routes.SetupRoutes(r)
	// Start server
	r.Run(":" + port)
	log.Println("Server is running")
}

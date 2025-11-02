package controllers

import (
	"kaskade_backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GetUsers(c *gin.Context, db *gorm.DB) {
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context, db *gorm.DB) {
	var req models.RegisterRequest

	// 尝试解析请求体为 JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON: " + err.Error(),
		})
		return
	}

	var user models.User
	// 查找是否已存在user
	if db.Where("username = ?", req.Username).Find(&user).RowsAffected != 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "username exists"})
		return
	} else if db.Where("email = ?", req.Email).Find(&user).RowsAffected != 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "email exists"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user = models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)

}

func GetUser(c *gin.Context, db *gorm.DB) {
	var req models.LoginRequest
	var founduser models.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON: " + err.Error(),
		})
		return
	}
	result := db.Where("username = ?", req.Username).Find(&founduser)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "username does not exist"})
		return
	} else {
		if err := bcrypt.CompareHashAndPassword([]byte(founduser.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Wrong password",
			})
			return
		}
		c.JSON(http.StatusOK, founduser)
	}

}

func DeleteUser(c *gin.Context, db *gorm.DB) {
	username := c.Param("username")
	if db.Where("username = ?", username).Delete(&models.User{}).RowsAffected != 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "username not found, deletion failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

// func UpdateUser(c *gin.Context) {

// 	id := c.Param("id")
// 	objID, err := primitive.ObjectIDFromHex(id)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
// 		return
// 	}

// 	collection := config.GetCollection("users")
// 	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
// 	defer cancel()

// 	var updateData map[string]interface{}
// 	delete(updateData, "_id")

// 	if err := c.ShouldBindJSON(&updateData); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	update := bson.M{"$set": updateData}
// 	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)

// 	// var user models.User
// 	// if err := c.ShouldBindJSON(&user); err != nil {
// 	// 	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 	// 	return
// 	// }
// 	// _, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": user})
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, updateData)
// }

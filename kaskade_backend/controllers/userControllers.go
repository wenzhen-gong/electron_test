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
	var user models.User

	// 尝试解析请求体为 JSON
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON: " + err.Error(),
		})
		return
	}
	// 查找是否已存在user
	if db.Where("username = ?", user.Username).Find(&user).RowsAffected != 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "username exists"})
		return
	} else if db.Where("email = ?", user.Email).Find(&user).RowsAffected != 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "email exists"})
		return
	}
	HashedPassord, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Hashing failed: " + err.Error(),
		})
		return
	}
	user.PasswordHash = string(HashedPassord)
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)

}

// func GetUser(c *gin.Context) {
// 	id := c.Param("id")
// 	objID, err := primitive.ObjectIDFromHex(id)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
// 		return
// 	}
// 	collection := db.GetCollection("users")
// 	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
// 	defer cancel()
// 	var user models.User
// 	if err := collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, user)

// }

// func DeleteUser(c *gin.Context) {
// 	id := c.Param("id")
// 	objID, err := primitive.ObjectIDFromHex(id)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
// 		return
// 	}
// 	collection := config.GetCollection("users")
// 	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
// 	defer cancel()

// 	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})

// }
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

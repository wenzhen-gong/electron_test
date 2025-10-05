package config

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

func ConnectDatabase() {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017/")
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB: ", err)
	}
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("MongoDB is not reachable: ", err)
	}
	DB = client
	log.Println("Successfully connected to MongoDB")
}

func GetCollection(collectionName string) *mongo.Collection {
	return DB.Database("unit11dev").Collection(collectionName)
}

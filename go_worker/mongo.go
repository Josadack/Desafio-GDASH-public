package main

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoClient guarda a conexão com o MongoDB
var MongoClient *mongo.Client

// ConnectMongo conecta ao MongoDB usando a URI passada
func ConnectMongo(uri string) {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}
	MongoClient = client
}

// SaveWeather salva os dados de clima no MongoDB
// ALTERAÇÃO: mudamos o tipo de WeatherResponse → WeatherPayload
// para usar o mesmo tipo que você consome do RabbitMQ
func SaveWeather(data WeatherPayload) {
	collection := MongoClient.Database("gdash").Collection("weather")
	_, err := collection.InsertOne(context.Background(), data)
	if err != nil {
		log.Println("Erro ao salvar no MongoDB:", err)
	}
}

// // package main

// // import (
// // 	"log"
// // 	"os"
// // 	"strconv"
// // 	"time"
// // )

// // func main() {
// // 	rabbitURL := os.Getenv("RABBIT_URL")
// // 	queueFull := os.Getenv("QUEUE_FULL")
// // 	backendURL := os.Getenv("BACKEND_URL")
// // 	mongoURI := os.Getenv("MONGO_URI")
// // 	retryDelay, _ := strconv.Atoi(os.Getenv("RECONNECT_DELAY"))

// // 	if rabbitURL == "" || queueFull == "" || backendURL == "" || mongoURI == "" {
// // 		log.Fatal("Variáveis de ambiente obrigatórias não definidas")
// // 	}

// // 	// Conecta no MongoDB
// // 	ConnectMongo(mongoURI)

// // 	// Conecta no RabbitMQ com retry
// // 	conn, ch, err := ConnectRabbitMQWithRetry(rabbitURL, queueFull, 0, time.Duration(retryDelay)*time.Second)
// // 	if err != nil {
// // 		log.Fatal("Não foi possível conectar ao RabbitMQ:", err)
// // 	}
// // 	defer conn.Close()
// // 	defer ch.Close()

// // 	log.Println("Go Worker iniciado!")
// // 	ConsumeMessages(ch, queueFull, backendURL) // consome mensagens da fila correta
// }

package main

import (
	"log"
	"os"
	"strconv"
	"time"
)

func main() {
	// -------------------------
	// Ler variáveis de ambiente
	// -------------------------
	rabbitURL := os.Getenv("RABBIT_URL")     // URL do RabbitMQ
	queueFull := os.Getenv("QUEUE_FULL")     // Nome da fila para mensagens de clima
	backendURL := os.Getenv("BACKEND_URL")   // URL do NestJS
	mongoURI := os.Getenv("MONGO_URI")       // URI do MongoDB
	retryDelay, _ := strconv.Atoi(os.Getenv("RECONNECT_DELAY")) // Delay em segundos para reconexão

	// -------------------------
	// Validar variáveis obrigatórias
	// -------------------------
	if rabbitURL == "" || queueFull == "" || backendURL == "" || mongoURI == "" {
		log.Fatal("[Erro] Variáveis de ambiente obrigatórias não definidas. Verifique .env")
	}

	// -------------------------
	// Conectar no MongoDB
	// -------------------------
	ConnectMongo(mongoURI)
	log.Println("[MongoDB] Conectado com sucesso!")

	// -------------------------
	// Conectar no RabbitMQ com retry
	// -------------------------
	conn, ch, err := ConnectRabbitMQWithRetry(rabbitURL, queueFull, 0, time.Duration(retryDelay)*time.Second)
	if err != nil {
		log.Fatal("[RabbitMQ] Não foi possível conectar:", err)
	}
	defer conn.Close() // garante fechamento da conexão ao finalizar
	defer ch.Close()   // garante fechamento do channel

	log.Println("[Worker] Go Worker iniciado!")

	// -------------------------
	// Consumir mensagens da fila
	// -------------------------
	// Esta função vai:
	// - ler mensagens do RabbitMQ
	// - converter para struct WeatherPayload
	// - enviar para NestJS via POST
	// - confirmar a mensagem no RabbitMQ (Ack) ou reencaminhar se falhar (Nack)
	ConsumeMessages(ch, queueFull, backendURL)
}

package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

// -------------------------
// Health server (Render)
// -------------------------
func startHealthServer() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("GDASH Go Worker running"))
	})

	log.Println("🩺 Health server rodando na porta", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// -------------------------
// Keep-alive ping (manter Render acordado)
// -------------------------
func startKeepAlive(interval time.Duration) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	url := "http://localhost:" + port + "/"

	go func() {
		for {
			resp, err := http.Get(url)
			if err != nil {
				log.Println("[KeepAlive] Falha ao pingar:", err)
			} else {
				resp.Body.Close()
				log.Println("💓 Keep-alive ping enviado para", url)
			}
			time.Sleep(interval)
		}
	}()
}

// -------------------------
// Main
// -------------------------
func main() {
	// -------------------------
	// Health server
	// -------------------------
	go startHealthServer()

	// -------------------------
	// Keep-alive ping a cada 1 minuto
	// -------------------------
	startKeepAlive(60 * time.Minute)

	// -------------------------
	// Ler variáveis de ambiente
	// -------------------------
	rabbitURL := os.Getenv("RABBIT_URL")
	queueFull := os.Getenv("QUEUE_FULL")
	backendURL := os.Getenv("BACKEND_URL")
	mongoURI := os.Getenv("MONGO_URI")
	retryDelay, _ := strconv.Atoi(os.Getenv("RECONNECT_DELAY"))

	if retryDelay == 0 {
		retryDelay = 5
	}

	// -------------------------
	// Validar variáveis obrigatórias
	// -------------------------
	if rabbitURL == "" || queueFull == "" || backendURL == "" || mongoURI == "" {
		log.Fatal("[Erro] Variáveis de ambiente obrigatórias não definidas")
	}

	// -------------------------
	// Conectar no MongoDB
	// -------------------------
	ConnectMongo(mongoURI)
	log.Println("[MongoDB] Conectado com sucesso!")

	// -------------------------
	// Conectar no RabbitMQ (retry infinito)
	// -------------------------
	conn, ch, err := ConnectRabbitMQWithRetry(
		rabbitURL,
		queueFull,
		0,
		time.Duration(retryDelay)*time.Second,
	)
	if err != nil {
		log.Fatal("[RabbitMQ] Erro fatal:", err)
	}
	defer conn.Close()
	defer ch.Close()

	log.Println("[Worker] Go Worker iniciado com sucesso 🚀")

	// -------------------------
	// Consumir mensagens
	// -------------------------
	ConsumeMessages(ch, queueFull, backendURL)
}

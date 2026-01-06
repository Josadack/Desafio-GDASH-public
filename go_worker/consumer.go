package main

import (
    "encoding/json"
    "log"
    "os"
    "time"

    // amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherPayload struct {
     City        string  `json:"city"`
    Temperature float64 `json:"temperature"`
    Humidity    float64 `json:"humidity"`
    Condition   string  `json:"condition"`
    WindSpeed   float64 `json:"wind_speed"`   // alterado
    Timestamp   string  `json:"timestamp"`    // adicionar timestamp atual
}

func StartConsumer() {
    rabbitURL := os.Getenv("RABBITMQ_URL")
    queue := os.Getenv("RABBITMQ_QUEUE")
    backendURL := os.Getenv("BACKEND_URL")

    if rabbitURL == "" || queue == "" || backendURL == "" {
        log.Fatal("RABBITMQ_URL, RABBITMQ_QUEUE e BACKEND_URL são obrigatórios")
    }

    conn, ch, err := ConnectRabbitMQWithRetry(rabbitURL, queue, 0, 3*time.Second)
    if err != nil {
        log.Fatalf("Falha ao conectar ao RabbitMQ: %v", err)
    }
    defer conn.Close()
    defer ch.Close()

    ch.Qos(1, 0, false)

    msgs, err := ch.Consume(queue, "", false, false, false, false, nil)
    if err != nil {
        log.Fatalf("Erro ao iniciar consumer: %v", err)
    }

    log.Println("[Worker] Aguardando mensagens...")

    for msg := range msgs {
        var payload WeatherPayload

        if err := json.Unmarshal(msg.Body, &payload); err != nil {
            log.Println("[Erro] JSON inválido:", err)
            msg.Nack(false, false)
            continue
        }

        log.Printf("[Worker] Mensagem recebida: %+v\n", payload)

        // agora sim → usamos a função CORRETA
        err := SendToBackend(payload, backendURL)
        if err != nil {
            log.Printf("[Erro] Falha ao enviar para API NestJS: %v", err)
            msg.Nack(false, true)
            continue
        }

        msg.Ack(false)
    }
}


package main

import (
	"encoding/json"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

// ConsumeMessages consome mensagens da fila RabbitMQ, envia para o backend e confirma no RabbitMQ.
// Parâmetros:
// - ch: canal do RabbitMQ
// - queue: nome da fila
// - backendURL: URL do NestJS para enviar os dados
func ConsumeMessages(ch *amqp.Channel, queue string, backendURL string) {
	// Iniciar consumo da fila
	msgs, err := ch.Consume(
		queue, // nome da fila
		"",    // consumer, vazio = automático
		false, // NÃO usar autoAck → vamos controlar manualmente
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,   // args
	)
	if err != nil {
		log.Fatal("[RabbitMQ] Erro ao iniciar consumo da fila:", err)
	}

	log.Println("📡 Consumindo mensagens da fila:", queue)

	// Loop principal de consumo
	for msg := range msgs {
		var data WeatherPayload

		// Converter JSON recebido para struct WeatherPayload
		if err := json.Unmarshal(msg.Body, &data); err != nil {
			log.Println("❌ Erro ao converter JSON:", err)
			msg.Nack(false, false) // rejeita a mensagem sem reencaminhar
			continue
		}

		log.Println("📥 Mensagem recebida:", data)

		// Enviar dados para o NestJS
		if backendURL != "" {
			if err := SendToBackend(data, backendURL); err != nil {
				log.Println("⚠ Erro ao enviar ao backend:", err)
				msg.Nack(false, true) // rejeita e reencaminha a mensagem
				continue
			}
		}

		// Confirmar mensagem apenas se envio ao backend foi bem-sucedido
		msg.Ack(false)
		log.Println("[Worker] Mensagem confirmada no RabbitMQ")
	}
}

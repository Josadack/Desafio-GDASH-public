package main

import (
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func ConnectRabbitMQWithRetry(url string, queue string, retryCount int, delay time.Duration) (*amqp.Connection, *amqp.Channel, error) {
	log.Printf("[RabbitMQ] Tentando conectar... tentativa %d", retryCount+1)

	conn, err := amqp.Dial(url)
	if err != nil {
		// Retry infinito até estabilizar
		log.Printf("[Aviso] Falha na conexão com RabbitMQ: %v. Nova tentativa em %v...", err, delay)
		time.Sleep(delay)
		return ConnectRabbitMQWithRetry(url, queue, retryCount+1, delay)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, nil, err
	}

	// QoS obrigatório para worker
	err = ch.Qos(1, 0, false)
	if err != nil {
		return nil, nil, err
	}

	_, err = ch.QueueDeclare(
		queue, // nome
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return nil, nil, err
	}

	log.Printf("[RabbitMQ] Conectado e fila declarada: %s", queue)
	return conn, ch, nil
}

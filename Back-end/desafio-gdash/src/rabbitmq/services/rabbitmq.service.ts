import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private channel;
  private readonly QUEUE_IN = 'weather_queue';
  private readonly QUEUE_OUT = 'weather_full_queue';
  private readonly RABBIT_URL =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

  async onModuleInit() {
    await this.connect();
  }

  async connect(retryCount = 5, retryDelay = 5000) {
    for (let i = 0; i < retryCount; i++) {
      try {
        const connection = await amqp.connect(this.RABBIT_URL);
        this.channel = await connection.createChannel();

        await this.channel.assertQueue(this.QUEUE_IN, { durable: true });
        await this.channel.assertQueue(this.QUEUE_OUT, { durable: true });

        console.log('[Nest] RabbitMQ conectado e filas declaradas');
        return;
      } catch (error) {
        console.warn(`[Nest] Tentativa ${i + 1} de conexão falhou. Reconnect em ${retryDelay / 1000}s`);
        await new Promise((res) => setTimeout(res, retryDelay));
      }
    }
    throw new Error('[Nest] Não foi possível conectar ao RabbitMQ');
  }

  async sendCityRequest(dto: { city: string }) {
    this.channel.sendToQueue(this.QUEUE_IN, Buffer.from(JSON.stringify(dto)), {
      persistent: true,
    });
  }
}

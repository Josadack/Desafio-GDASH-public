import { Module } from '@nestjs/common';
import { RabbitmqService } from './services/rabbitmq.service';


@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService], // 🔹 exporta para outros módulos
})
export class RabbitmqModule {}

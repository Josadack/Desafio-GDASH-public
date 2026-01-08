import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from '../dto/create-weather.dto';
import { WeatherLogDto } from '../dto/weather-log.dto';
import { Weather, WeatherDocument } from '../entities/weather.entity';
import { RabbitmqService } from '../../rabbitmq/services/rabbitmq.service';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
    private readonly rabbit: RabbitmqService,
  ) {}

  // Envia só a cidade → RabbitMQ → Worker Python
  async create(dto: CreateWeatherDto) {
    await this.rabbit.sendCityRequest(dto);
    return { status: 'queued', city: dto.city };
  }

  // salva log vindo do worker
  async saveLog(dto: WeatherLogDto) {
    const created = new this.weatherModel(dto);
    await created.save();
    return { status: 'saved', id: created._id };
  }

  // histórico completo
  async findAll() {
    return this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .lean();
  }

  // total de registros
  async countRequests(): Promise<number> {
    return this.weatherModel.countDocuments().exec();
  }

  // último registro REAL
  async findLast() {
    return this.weatherModel
      .findOne()
      .sort({ createdAt: -1 })
      .lean();
  }
}

import { Injectable, Optional } from '@nestjs/common';
import { WeatherService } from '../../weather/services/weather.service';
import { UsersService } from '../../users/service/users.service';
import { DashboardDto } from '../dto/dashboard.dto';


@Injectable()
export class DashboardService {
  constructor(
    private readonly weatherService: WeatherService,
    @Optional() private readonly usersService?: UsersService,
  ) {}

  async getDashboard(): Promise<DashboardDto> {
    // obtém todos os registros de clima (ou outro método que você tenha)
    const weatherData = await this.weatherService.findAll();

    // número total de requisições climáticas
    const totalWeatherRequests = Array.isArray(weatherData) ? weatherData.length : 0;

    // última leitura (puxando o último item do array)
    const lastWeather = Array.isArray(weatherData) && weatherData.length > 0
      ? weatherData[weatherData.length - 1]
      : null;

    // total de usuários (se UsersService estiver disponível)
    let totalUsers = 0;
    if (this.usersService && typeof this.usersService.countUsers === 'function') {
      totalUsers = await this.usersService.countUsers();
    }

    return {
      totalUsers,
      totalWeatherRequests,
      lastWeather,
      message: 'Dashboard loaded successfully',
    };
  }
}
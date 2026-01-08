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
  const [totalWeatherRequests, lastWeather, totalUsers] = await Promise.all([
    this.weatherService.countRequests(),
    this.weatherService.findLast(),
    this.usersService?.countUsers?.() ?? 0,
  ]);

  return {
    totalUsers,
    totalWeatherRequests,
    lastWeather,
    message: 'Dashboard loaded successfully',
  };
}

}
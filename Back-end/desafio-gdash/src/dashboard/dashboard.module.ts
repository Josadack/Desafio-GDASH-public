import { Module } from '@nestjs/common';
import { WeatherModule } from '../weather/weather.module';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [UsersModule, WeatherModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

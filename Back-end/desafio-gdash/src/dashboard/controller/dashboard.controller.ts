import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { DashboardService } from '../service/dashboard.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardDto } from '../dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

   @Get()
  async getDashboard(): Promise<DashboardDto> {
    return this.dashboardService.getDashboard();
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class DashboardDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalWeatherRequests: number;

    @ApiProperty({ nullable: true, type: Object })
  lastWeather: any | null;

  @ApiProperty()
  message?: string;
}

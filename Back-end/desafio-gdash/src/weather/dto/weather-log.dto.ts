import { ApiProperty } from '@nestjs/swagger';

export class WeatherLogDto {
  @ApiProperty()
  city: string;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  humidity: number;

  @ApiProperty()
  condition: string;

  @ApiProperty()
  wind_speed: number;

  @ApiProperty()
  timestamp: string;
}

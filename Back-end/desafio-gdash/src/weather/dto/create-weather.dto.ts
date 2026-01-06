import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateWeatherDto {
  @ApiProperty()
  @IsString()
  city: string;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true })
  city: string;

  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  condition: string;

  @Prop()
  wind_speed: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);

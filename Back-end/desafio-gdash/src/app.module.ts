import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { WeatherModule } from "./weather/weather.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),
    RabbitmqModule,
    UsersModule,
    AuthModule,
    WeatherModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

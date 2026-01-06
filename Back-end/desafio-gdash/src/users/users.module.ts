import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { Bcrypt } from '../auth/bcrypt/bcrypt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, Bcrypt],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

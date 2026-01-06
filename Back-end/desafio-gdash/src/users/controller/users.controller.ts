import { Controller, Post, Body, Get, Param, UseGuards, Delete, Put } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../service/users.service';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiBearerAuth()
@ApiTags('user')
@Controller("/users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('/auth/register')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('/all')
  find() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
  
  
}



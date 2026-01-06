// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { Bcrypt } from '../../auth/bcrypt/bcrypt';
import { UpdateUserDto } from '../dto/update-user.dto';


@Injectable()
export class UsersService {
 
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bcrypt: Bcrypt, // injeta o bcrypt
  ) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password');
  }

  async create(user: Partial<User>): Promise<UserDocument> {
    // hash da senha antes de salvar
    if (user.password) {
      user.password = await this.bcrypt.criptografarSenha(user.password);
    }

    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async countUsers(): Promise<number> {
  return this.userModel.countDocuments().exec();
}

async update(id: string, data: UpdateUserDto): Promise<User> {
  if (data.password) {
    data.password = await this.bcrypt.criptografarSenha(data.password);
  }

  const user = await this.userModel.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!user) throw new NotFoundException('Usuário não encontrado');
  return user;
}

  async delete(id: string): Promise<void> {
    const deleted = await this.userModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Usuário não encontrado');
  }


}

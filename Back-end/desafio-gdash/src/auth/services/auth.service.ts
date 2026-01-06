import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from '../../users/service/users.service';
import { Bcrypt } from '../bcrypt/bcrypt';



@Injectable()
export class AuthService{
    constructor(
        private usuarioService: UsersService,
        private jwtService: JwtService,
        private bcrypt: Bcrypt
    ){ }

  async validateUser(email: string, password: string): Promise<any> {

  const user = await this.usuarioService.findByEmail(email)

  if (!user) {
    throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND)
  }

  const matchPassword = await this.bcrypt.compararSenhas(password, user.password)

  if (!matchPassword) {
    throw new HttpException('Senha inválida!', HttpStatus.UNAUTHORIZED)
  }

  const { password: _, ...result } = user
  return result
}


    async login(userLogin: { email: string, password: string }) {

  const user = await this.usuarioService.findByEmail(userLogin.email)

  if (!user) {
    throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND)
  }

  const payload = { sub: user.id, email: user.email }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: `Bearer ${this.jwtService.sign(payload)}`,
  }
}

}
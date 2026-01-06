import { ApiProperty } from "@nestjs/swagger"

export class UsuarioLogin {

    @ApiProperty() 
    email: string;

    @ApiProperty() 
  password: string;

}
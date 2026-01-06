import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "../constants/constants";
import { UsersService } from "../../users/service/users.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any) {
        // payload = { sub: userId, email: string }

        const user = await this.usersService.findById(payload.sub);


        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        // Esse retorno vira req.user
        return {
            id: user.id,
            email: user.email,
            
        };
    }
}

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../auth/auth.service';
import { Injectable } from '@nestjs/common';
import { TokenPayloadType } from 'src/lib/types/token-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies?.Refresh,
            ]),
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: TokenPayloadType) {
        return this.authService.verifyUserRefreshToken(
            request.cookies?.Refresh,
            payload.id,
        );
    }
}
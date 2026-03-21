import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = configService.get<string>('auth.jwtRefreshSecret');
    if (!secretKey) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '').trim();
    const { sub: id } = payload;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }

    // Verify that the presented refresh token matches the stored bcrypt hash.
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch || !user.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    // Only return safe fields for authorization guards.
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }
} 
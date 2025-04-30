import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { User, Role } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = configService.get<string>('auth.jwtSecret');
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any): Promise<User> {
    const { sub: id } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    
    // Convert null values to undefined and ensure role is the correct enum type
    const sanitizedUser = {
      ...user,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      refreshToken: user.refreshToken || undefined,
      // Ensure role is converted to the correct enum type
      role: user.role as unknown as Role
    };

    return new User(sanitizedUser);
  }
} 
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenDto } from './dto/token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      return await this.usersService.validateUser(email, password);
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<TokenDto> {
    try {
      const createUserDto: CreateUserDto = {
        ...registerDto,
        // Prevent public users from role escalation by overwriting any provided role.
        role: Role.USER,
      };

      const user = await this.usersService.create(createUserDto);
      return this.generateTokens(user);
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenDto> {
    try {
      const { refreshToken } = refreshTokenDto;
      
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('auth.jwtRefreshSecret'),
      });

      // Check if this refresh token matches the stored (bcrypt-hashed) refresh token.
      const storedRefreshTokenHash =
        await this.usersService.getRefreshTokenHash(payload.sub);

      if (!storedRefreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(
        refreshToken,
        storedRefreshTokenHash,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findOne(payload.sub);

      if (!user?.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token in database
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(user: User): Promise<TokenDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: this.configService.get('auth.jwtExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwtRefreshSecret'),
        expiresIn: this.configService.get('auth.jwtRefreshExpiresIn'),
      }),
    ]);

    // Store the refresh token in the database
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
} 
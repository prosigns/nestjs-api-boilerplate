import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepositoryFactory } from './repositories/user-repository.factory';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private userRepository;

  constructor(
    private readonly userRepositoryFactory: UserRepositoryFactory,
    private readonly configService: ConfigService,
  ) {
    this.userRepository = this.userRepositoryFactory.getRepository();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await this.hashPassword(createUserDto.password);

      // Create the user
      const user = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return new User(user);
    } catch (error) {
      if (error.code === 'P2002' || error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(skip = 0, take = 10): Promise<User[]> {
    const users = await this.userRepository.findAll(skip, take);
    return users.map(user => new User(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);
    return new User(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByField('email', email);
    return new User(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findOne(id);

    // Hash the password if it's provided
    const data = { ...updateUserDto };
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    // Update the user
    const updatedUser = await this.userRepository.update(id, data);
    return new User(updatedUser);
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findOne(id);
    await this.userRepository.delete(id);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    let data: { refreshToken: string | null } = { refreshToken: null };
    
    if (refreshToken) {
      const hashedRefreshToken = await this.hashPassword(refreshToken);
      data = { refreshToken: hashedRefreshToken };
    }

    await this.userRepository.update(userId, data);
  }

  /**
   * Returns the stored refresh token hash for comparison during refresh flows.
   * (The public `User` entity constructor strips refreshToken for API responses.)
   */
  async getRefreshTokenHash(userId: string): Promise<string | null> {
    const userRecord = await this.userRepository.findOne(userId);
    return userRecord?.refreshToken ?? null;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByField('email', email);

      if (user && await this.comparePasswords(password, user.password)) {
        return new User(user);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
} 
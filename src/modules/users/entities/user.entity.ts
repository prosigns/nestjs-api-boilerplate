import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export class User {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiHideProperty()
  @Exclude()
  password?: string;

  @ApiProperty({ description: 'First name', nullable: true })
  firstName?: string;

  @ApiProperty({ description: 'Last name', nullable: true })
  lastName?: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  role: Role;

  @ApiProperty({ description: 'Account status' })
  isActive: boolean;

  @ApiHideProperty()
  @Exclude()
  refreshToken?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    
    // Remove sensitive data
    delete this.password;
    delete this.refreshToken;
  }
} 
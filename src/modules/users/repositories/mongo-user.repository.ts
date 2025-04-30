import { Injectable } from '@nestjs/common';
import { MongoRepository } from '../../../common/database/repository/mongo.repository';
import { User } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository extends MongoRepository<User> {} 
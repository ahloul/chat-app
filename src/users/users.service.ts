import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../chat/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await user.save();


    await this.redisService.cacheUser(savedUser);

    return savedUser;
  }

  async findOne(username: string): Promise<User | undefined> {

    const cachedUser = await this.redisService.getCachedUser(username);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findOne({ username }).exec();

    if (user) {
      await this.redisService.cacheUser(user);
    }

    return user;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = (user as UserDocument).toObject();
      return result;
    }
    return null;
  }
}

import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RedisService {
  private redisClient: RedisClientType;
  private publisher: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: 'redis://redis:6379',
    });

    this.publisher = createClient({
      url: 'redis://redis:6379',
    });

    this.redisClient.connect();
    this.publisher.connect();
  }

  async publish(channel: string, message: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    this.redisClient.subscribe(channel, (message: string) => {
      callback(JSON.parse(message));
    });
  }

  async cacheUser(user: User): Promise<void> {
    const key = `user:${user.username}`;
    await this.redisClient.set(key, JSON.stringify(user), {
      EX: 3600,
    });
  }

  async getCachedUser(username: string): Promise<User | null> {
    const key = `user:${username}`;
    const cachedUser = await this.redisClient.get(key);
    if (cachedUser) {
      return JSON.parse(cachedUser) as User;
    }
    return null;
  }
}

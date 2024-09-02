import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/chat-app'),
    AuthModule,
    UsersModule,
    ChatModule,
  ],
})
export class AppModule {}

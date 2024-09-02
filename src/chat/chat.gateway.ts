import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RedisService } from './redis.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  afterInit(server: Server) {
    console.log('Chat Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: CreateMessageDto,
  ): Promise<void> {
    const message = await this.chatService.createMessage(payload);

    if (
      await this.chatService.isUserInPrivateGroup(payload.room, payload.sender)
    ) {
      this.server.to(payload.room).emit('message', message);
      await this.redisService.publish('message', message);
    } else {
      client.emit('error', 'Unauthorized to send messages in this group.');
    }
  }

  @SubscribeMessage('sendDirectMessage')
  async handleDirectMessage(
    client: Socket,
    payload: CreateMessageDto,
  ): Promise<void> {
    const message = await this.chatService.createDirectMessage(payload);
    this.server.to(payload.recipientId).emit('directMessage', message);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    client: Socket,
    payload: {
      messageId: string;
      roomId?: string;
      recipientId?: string;
      sender: string;
    },
  ): Promise<void> {
    const result = await this.chatService.deleteMessage(
      payload.messageId,
      payload.sender,
    );

    if (result) {
      if (payload.roomId) {
        this.server
          .to(payload.roomId)
          .emit('messageDeleted', payload.messageId);
      } else if (payload.recipientId) {
        this.server
          .to(payload.recipientId)
          .emit('directMessageDeleted', payload.messageId);
      }
    } else {
      client.emit('error', 'Unable to delete message.');
    }
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    client: Socket,
    payload: EditMessageDto,
  ): Promise<void> {
    const updatedMessage = await this.chatService.editMessage(
      payload.messageId,
      payload.newContent,
      payload.sender,
    );

    if (updatedMessage) {
      if (payload.roomId) {
        this.server.to(payload.roomId).emit('messageEdited', updatedMessage);
      } else if (payload.recipientId) {
        this.server
          .to(payload.recipientId)
          .emit('directMessageEdited', updatedMessage);
      }
    } else {
      client.emit('error', 'Unable to edit message.');
    }
  }

  @SubscribeMessage('searchMessages')
  async handleSearchMessages(
    client: Socket,
    payload: {
      keyword: string;
      roomId?: string;
      recipientId?: string;
      sender: string;
    },
  ): Promise<void> {
    let messages;

    if (payload.roomId) {
      messages = await this.chatService.searchMessagesInRoom(
        payload.roomId,
        payload.keyword,
      );
    } else if (payload.recipientId && payload.sender) {
      messages = await this.chatService.searchDirectMessages(
        payload.recipientId,
        payload.sender,
        payload.keyword,
      );
    }

    client.emit('searchResults', messages);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    client.emit('leftRoom', room);
  }
}

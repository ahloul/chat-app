import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RedisService } from './redis.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { Server, Socket } from 'socket.io';
import { Message } from './entities/message.entity';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  let chatService: ChatService;
  let redisService: RedisService;
  let server: Server;
  let client: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            createMessage: jest.fn(),
            createDirectMessage: jest.fn(),
            deleteMessage: jest.fn(),
            editMessage: jest.fn(),
            searchMessagesInRoom: jest.fn(),
            searchDirectMessages: jest.fn(),
            isUserInPrivateGroup: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    chatGateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    redisService = module.get<RedisService>(RedisService);
    server = new Server();
    client = {
      id: 'mock-socket-id',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;
    chatGateway.server = server;
  });

  describe('handleMessage', () => {
    it('should handle sending a message', async () => {
      const payload: CreateMessageDto = {
        content: 'Hello',
        sender: '1',
        recipientId: '2',
        room: 'room1',
      };
      const message = { id: '1', ...payload } as Message & { id: string };
      jest.spyOn(chatService, 'createMessage').mockResolvedValue(message);
      jest.spyOn(chatService, 'isUserInPrivateGroup').mockResolvedValue(true);
      jest.spyOn(redisService, 'publish').mockResolvedValue();

      await chatGateway.handleMessage(client, payload);

      expect(chatService.createMessage).toHaveBeenCalledWith(payload);
      expect(redisService.publish).toHaveBeenCalledWith('message', message);
    });
  });

  describe('handleDirectMessage', () => {
    it('should handle sending a direct message', async () => {
      const payload: CreateMessageDto = {
        content: 'Hello',
        sender: '1',
        recipientId: '2',
        room: 'room1',
      };
      const message = {
        id: '1',
        content: 'Hello',
        room: 'room1',
        sender: '1',
        recipientId: '2',
        timestamp: new Date(),
      } as Message & { id: string };
      jest.spyOn(chatService, 'createDirectMessage').mockResolvedValue(message);

      await chatGateway.handleDirectMessage(client, payload);

      expect(chatService.createDirectMessage).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleDeleteMessage', () => {
    it('should handle deleting a message', async () => {
      const payload = { messageId: '1', roomId: 'room1', sender: '1' };
      jest.spyOn(chatService, 'deleteMessage').mockResolvedValue(true);

      await chatGateway.handleDeleteMessage(client, payload);

      expect(chatService.deleteMessage).toHaveBeenCalledWith(
        payload.messageId,
        payload.sender,
      );
    });
  });

  describe('handleEditMessage', () => {
    it('should handle editing a message', async () => {
      const payload: EditMessageDto = {
        messageId: '1',
        newContent: 'Updated',
        sender: '1',
        roomId: 'room1',
      };
      const updatedMessage = {
        id: '1',
        content: 'Updated',
        room: 'room1',
        sender: '1',
        timestamp: new Date(),
      } as Message & { id: string };
      jest.spyOn(chatService, 'editMessage').mockResolvedValue(updatedMessage);

      await chatGateway.handleEditMessage(client, payload);

      expect(chatService.editMessage).toHaveBeenCalledWith(
        payload.messageId,
        payload.newContent,
        payload.sender,
      );
    });
  });

  describe('handleSearchMessages', () => {
    it('should handle searching messages in a room', async () => {
      const payload = { keyword: 'Hello', roomId: 'room1', sender: '1' };
      const messages = [
        { id: '1', content: 'Hello', room: 'room1', sender: '1', timestamp: new Date() },
      ] as Message[] & { id: string }[];
      jest.spyOn(chatService, 'searchMessagesInRoom').mockResolvedValue(messages);

      await chatGateway.handleSearchMessages(client, payload);

      expect(chatService.searchMessagesInRoom).toHaveBeenCalledWith(
        payload.roomId,
        payload.keyword,
      );
    });
  });

  describe('handleJoinRoom', () => {
    it('should handle joining a room', () => {
      const room = 'room1';
      client.join = jest.fn();

      chatGateway.handleJoinRoom(client, room);

      expect(client.join).toHaveBeenCalledWith(room);
    });
  });

  describe('handleLeaveRoom', () => {
    it('should handle leaving a room', () => {
      const room = 'room1';
      client.leave = jest.fn();

      chatGateway.handleLeaveRoom(client, room);

      expect(client.leave).toHaveBeenCalledWith(room);
    });
  });
});
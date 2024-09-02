import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { Message, MessageDocument } from './entities/message.entity';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';

describe('ChatService', () => {
  let service: ChatService;
  let messageModel: Model<MessageDocument>;

  beforeEach(async () => {
    const messageModelMock = {
      save: jest.fn().mockResolvedValue({
        _id: 'some-id',
        content: 'Hello',
        sender: '1',
        recipientId: '2',
        room: 'room1',
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Message.name),
          useValue: messageModelMock,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageModel = module.get<Model<MessageDocument>>(getModelToken(Message.name));
  });



  describe('deleteMessage', () => {
    it('should delete a message if it exists and return true', async () => {
      const messageId = '1';
      const sender = '1';
      const message = {
        _id: messageId,
        sender,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(messageModel, 'findOne').mockResolvedValue(message as any);

      const result = await service.deleteMessage(messageId, sender);

      expect(message.deleteOne).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if the message does not exist', async () => {
      jest.spyOn(messageModel, 'findOne').mockResolvedValue(null);

      const result = await service.deleteMessage('1', '1');

      expect(result).toBe(false);
    });
  });

  describe('editMessage', () => {
    it('should edit and save a message if it exists', async () => {
      const messageId = '1';
      const newContent = 'Updated';
      const sender = '1';
      const message = {
        _id: messageId,
        sender,
        content: 'Old',
        save: jest.fn().mockResolvedValue({ content: newContent }),
      };
      jest.spyOn(messageModel, 'findOne').mockResolvedValue(message as any);

      const result = await service.editMessage(messageId, newContent, sender);

      expect(message.save).toHaveBeenCalled();
      expect(result.content).toBe(newContent);
    });

    it('should return null if the message does not exist', async () => {
      jest.spyOn(messageModel, 'findOne').mockResolvedValue(null);

      const result = await service.editMessage('1', 'Updated', '1');

      expect(result).toBeNull();
    });
  });

  describe('isUserInPrivateGroup', () => {
    it('should return true (placeholder implementation)', async () => {
      const result = await service.isUserInPrivateGroup('room1', '1');
      expect(result).toBe(true);
    });
  });

  describe('searchMessagesInRoom', () => {
    it('should return messages containing the keyword', async () => {
      const messages = [
        { content: 'Hello', room: 'room1' },
        { content: 'Hi', room: 'room1' },
      ];
      jest.spyOn(messageModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(messages),
      } as any);

      const result = await service.searchMessagesInRoom('room1', 'Hello');

      expect(result).toEqual(messages);
    });
  });

  describe('searchDirectMessages', () => {
    it('should return direct messages containing the keyword', async () => {
      const messages = [
        { content: 'Hello', sender: '1', recipientId: '2' },
        { content: 'Hi', sender: '2', recipientId: '1' },
      ];
      jest.spyOn(messageModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(messages),
      } as any);

      const result = await service.searchDirectMessages('2', '1', 'Hello');

      expect(result).toEqual(messages);
    });
  });
});
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { Message, MessageDocument } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const createdMessage = new this.messageModel(createMessageDto);
    return createdMessage.save();
  }

  async createDirectMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const createdMessage = new this.messageModel(createMessageDto);
    return createdMessage.save();
  }

  async deleteMessage(messageId: string, sender: string): Promise<boolean> {
    const message = await this.messageModel.findOne({ _id: messageId, sender });
    if (message) {
      await message.deleteOne();
      return true;
    }
    return false;
  }

  async editMessage(
    messageId: string,
    newContent: string,
    sender: string,
  ): Promise<Message | null> {
    const message = await this.messageModel.findOne({ _id: messageId, sender });
    if (message) {
      message.content = newContent;
      message.timestamp = new Date();
      await message.save();
      return message;
    }
    return null;
  }

  async isUserInPrivateGroup(roomId: string, userId: string): Promise<boolean> {
    return true;
  }

  async searchMessagesInRoom(
    roomId: string,
    keyword: string,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        room: roomId,
        content: { $regex: keyword, $options: 'i' },
      })
      .exec();
  }

  async searchDirectMessages(
    recipientId: string,
    senderId: string,
    keyword: string,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { sender: senderId, recipientId },
          { sender: recipientId, recipientId: senderId },
        ],
        content: { $regex: keyword, $options: 'i' },
      })
      .exec();
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  recipientId?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

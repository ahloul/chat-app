import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
  @ApiProperty({ description: 'The ID of the message to edit' })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({ description: 'The new content of the message' })
  @IsString()
  @IsNotEmpty()
  newContent: string;

  @ApiProperty({ description: 'The sender ID' })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({ description: 'The ID of the chat room' })
  @IsString()
  roomId?: string;

  @ApiProperty({ description: 'The recipient ID for direct messages' })
  @IsString()
  recipientId?: string;
}

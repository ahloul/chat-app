import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'The ID of the chat room' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ description: 'The message content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The sender ID' })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({ description: 'The recipient ID for direct messages' })
  @IsString()
  recipientId?: string;
}

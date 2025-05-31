import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactRequestDto {
  @ApiProperty({ description: 'Sender name', example: 'John Doe' })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Sender email', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Sender phone', example: '+3806345678' })
  @IsPhoneNumber('UA', { message: 'Invalid phone number format' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Message content', example: 'Hello, I have a question about...' })
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @ApiProperty({ description: 'Hidden honeypot field (anti-spam)', required: false })
  @IsOptional()
  hidden?: string;
}

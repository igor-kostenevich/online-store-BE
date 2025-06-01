import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactRequestDto {
  @ApiProperty({
    description: 'Sender name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Sender email',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Sender phone (must be valid Ukrainian number)',
    example: '+380634567890',
    pattern: '^\\+380\\d{9}$',
  })

  @IsPhoneNumber('UA', { message: 'Invalid phone number format' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Message content (10–2000 characters)',
    example: 'Hello, I have a question about...',
    minLength: 10,
    maxLength: 2000,
  })
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @ApiProperty({ description: 'Hidden honeypot field (anti-spam)', required: false })
  @IsOptional()
  hidden?: string;
}

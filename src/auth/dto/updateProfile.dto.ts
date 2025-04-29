import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileRequest {
  @ApiPropertyOptional({ description: 'New name', example: 'John Updated' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (value === '' ? undefined : value))
  name?: string;

  @ApiPropertyOptional({ description: 'New phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => (value === '' ? undefined : value))
  phone?: string;

  @ApiPropertyOptional({ description: 'New address', example: '456 Updated St, NY' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? undefined : value))
  address?: string;

  hasAtLeastOneField(): boolean {
    return !!(this.name || this.phone || this.address);
  }
}

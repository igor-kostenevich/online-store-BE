import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password is too short. Minimum length is 6 characters' })
  @MaxLength(128, { message: 'Password is too long. Maximum length is 128 characters' })
  password: string;

  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  name: string;
}
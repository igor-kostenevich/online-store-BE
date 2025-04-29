import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Res({passthrough: true}) res: Response, @Body() dto: RegisterRequest) {
    return await this.authService.register(res, dto)
  }

  @Post('login')
  @HttpCode(200)
  async login(@Res({passthrough: true}) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res, dto)
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return await this.authService.refresh(req, res)
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({passthrough: true}) res: Response) {
    return await this.authService.logout(res)
  }
}

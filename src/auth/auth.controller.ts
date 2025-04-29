import { AuthResponse } from './dto/auth.dto';
import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiConflictResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Response, Request } from 'express'


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register user',
    description: 'Register new user',
  })
  @ApiOkResponse({ type: AuthResponse})
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({ description: 'User already exists' })
  @Post('register')
  @HttpCode(201)
  async register(@Res({passthrough: true}) res: Response, @Body() dto: RegisterRequest) {
    return await this.authService.register(res, dto)
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'Login user',
  })
  @ApiOkResponse({ type: AuthResponse})
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('login')
  @HttpCode(200)
  async login(@Res({passthrough: true}) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res, dto)
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh access token',
  })
  @ApiOkResponse({ type: AuthResponse})
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return await this.authService.refresh(req, res)
  }

  @ApiOperation({
    summary: 'Logout user',
    description: 'Logout user',
  })
  @Post('logout')
  @HttpCode(200)
  async logout(@Res({passthrough: true}) res: Response) {
    return await this.authService.logout(res)
  }
}

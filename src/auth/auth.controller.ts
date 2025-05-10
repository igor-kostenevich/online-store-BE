import { UpdateProfileRequest } from './dto/updateProfile.dto';
import { AuthResponse } from './dto/auth.dto';
import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserProfileResponse } from './dto/responses/profile.dto';
import { Authorization } from './decorators/authorization.decorator';
import { ApiOperation, ApiOkResponse, ApiConflictResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Response, Request } from 'express'
import { Authorized } from './decorators/authorized.decorator';
import { User } from '@prisma/client';


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

  @Authorization()
  @Get('profile')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile', description: 'Returns current user profile' })
  @ApiOkResponse({ type: UserProfileResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async profile(@Authorized() user: User): Promise<UserProfileResponse> {
    return await this.authService.getProfile(user);
  }

  @Authorization()
  @Patch('profile')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile', description: 'Updates current user profile' })
  @ApiOkResponse({ type: UserProfileResponse })
  @ApiBadRequestResponse({ description: 'At least one field must be provided' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateProfile(
    @Authorized() user: User,
    @Body() dto: UpdateProfileRequest
  ): Promise<UserProfileResponse> {
    return await this.authService.updateProfile(user, dto);
  }
}

import { isDev } from './../utils/is-dev.util';
import type { JwtPayload } from './interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { RegisterRequest } from './dto/register.dto';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { hash, verify } from 'argon2'
import { LoginRequest } from './dto/login.dto';
import type { Response, Request } from 'express'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string
  private readonly JWT_REFRESH_TOKEN_TTL: string

  private readonly COOKIE_DOMAIN: string

  constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService, private readonly jwtService: JwtService) {
    this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL')
    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL')
    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN')
  }

  async register(res: Response, dto: RegisterRequest) {
    const { email, password, name } = dto;

    const existUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (existUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: await hash(password),
        name,
      },
    })

    return this.auth(res, user.id)
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      }
    })

    if(!user) {
      throw new NotFoundException('Invalid credentials')
    }

    const isPasswordValid = await verify(user.password, password)

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials')
    }

    return this.auth(res, user.id)
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken']

    if(!refreshToken) {
      throw new UnauthorizedException('Token not found')
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken)

    if(payload) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
        }
      })

      if(!user) {
        throw new UnauthorizedException('Invalid token')
      }

      return this.auth(res, user.id)
    }
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0))
    return true
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id)

    this.setCookie(res, refreshToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))

    return { accessToken }
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    } as JwtSignOptions)

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    } as JwtSignOptions)

    return { accessToken, refreshToken }
  }

  private setCookie( res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
      expires,
    })
  }
}

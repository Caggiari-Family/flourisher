import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

class LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    const expectedUsername = process.env.APP_USERNAME ?? 'admin';
    const expectedPassword = process.env.APP_PASSWORD ?? 'admin';

    if (dto.username !== expectedUsername || dto.password !== expectedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwt.signAsync({ sub: dto.username });
    return { access_token };
  }
}

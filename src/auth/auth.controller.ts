import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from 'src/models/user.models';
import { AuthService } from './auth.service';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  register(@Body('user', ValidationPipe) credentials: RegisterDTO) {
    return this.authService.register(credentials);
  }

  @Post('login')
  login(@Body('user', ValidationPipe) credentials: LoginDTO) {
    return this.authService.login(credentials);
  }
}

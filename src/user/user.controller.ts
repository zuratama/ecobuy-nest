import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/auth/user.decorator';
import { UpdateUserDTO, UserRO } from 'src/models/user.models';
import { UserEntity } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@User() currUser: UserEntity): UserRO {
    return this.authService.get(currUser);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(
    @User() currUser: UserEntity,
    @Body('user', new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateUserDTO,
  ): Promise<UserRO> {
    return this.authService.update(currUser, data);
  }
}

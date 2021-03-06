import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/user.entity';
import {
  LoginDTO,
  RegisterDTO,
  AuthPayload,
  UserRO,
  UpdateUserDTO,
} from 'src/models/user.models';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(credentials: RegisterDTO) {
    try {
      const user: UserEntity = this.userRepo.create(credentials);
      await user.save();
      return { user: this.signFromUser(user) };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username has already been taken');
      }
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginDTO) {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (user) {
        const isVaid = await user.comparePassword(password);
        if (isVaid) {
          return { user: this.signFromUser(user) };
        }
      }
      throw new UnauthorizedException('Invalid email or password');
    } catch (err) {
      throw err;
    }
  }

  async update(user: UserEntity, data: UpdateUserDTO): Promise<UserRO> {
    await this.userRepo.update({ id: user.id }, data);
    const updated = await this.userRepo.findOne({ where: { id: user.id } });
    return { user: this.signFromUser(updated) };
  }

  get(currUser: UserEntity): UserRO {
    return { user: this.signFromUser(currUser) };
  }

  private signFromUser(user: UserEntity): any {
    const payload: AuthPayload = {
      sub: user.id,
      username: user.username,
    };
    const token = this.jwtService.sign(payload);
    return { ...user.toJSON(), token };
  }
}

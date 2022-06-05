import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refreshToken.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password) {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findOne(email);
    if (!user) return null;

    const isMatched = await this.comparePassword(password, user.password);
    if (!isMatched) return null;

    return user;
  }

  async register(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const existing = await this.usersService.findOne(email);

    if (existing) {
      throw new ConflictException(
        'An account with this email has already exist',
      );
    }
    createUserDto.password = await this.hashPassword(createUserDto.password);

    const newUser = await this.usersService.create(createUserDto);
    return newUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const accessToken = await this.jwtService.signAsync({ user });
    const refreshToken = await this.jwtService.signAsync(
      { user },
      { expiresIn: '7d' },
    );
    
    const newRt = new this.refreshTokenModel({
      userId: user._id,
      refreshToken,
    });
    await newRt.save();

    return { accessToken, refreshToken };
  }
}

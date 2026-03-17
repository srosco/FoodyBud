import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string): Promise<{ access_token: string }> {
    // Check duplicate BEFORE hashing (hashing is expensive)
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, passwordHash);
    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }
}

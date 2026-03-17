import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UsersService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    users = { findByEmail: jest.fn(), create: jest.fn() } as any;
    jwt = { sign: jest.fn().mockReturnValue('test-token') } as any;

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('register() creates user with hashed password and returns token', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 'u1', email: 'a@b.com' } as any);

    const result = await service.register('a@b.com', 'password123');

    expect(users.create).toHaveBeenCalledWith('a@b.com', expect.any(String));
    const [, hash] = users.create.mock.calls[0];
    expect(await bcrypt.compare('password123', hash)).toBe(true);
    expect(result).toEqual({ access_token: 'test-token' });
  });

  it('register() throws ConflictException for duplicate email', async () => {
    users.findByEmail.mockResolvedValue({ id: 'u1' } as any);
    await expect(service.register('a@b.com', 'password123')).rejects.toThrow('Email already in use');
  });

  it('login() returns token for valid credentials', async () => {
    const hash = await bcrypt.hash('secret', 10);
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: hash } as any);

    const result = await service.login('a@b.com', 'secret');
    expect(result).toEqual({ access_token: 'test-token' });
  });

  it('login() throws UnauthorizedException for wrong password', async () => {
    const hash = await bcrypt.hash('correct', 10);
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: hash } as any);
    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow();
  });
});

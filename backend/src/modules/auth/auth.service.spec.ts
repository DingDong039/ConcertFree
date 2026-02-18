/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
// backend/src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';

// Mock bcryptjs at module level — avoids "Cannot redefine property" on spyOn
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs') as {
  compare: jest.Mock;
  hash: jest.Mock;
};

const mockUser = () => ({
  id: 'user-001',
  email: 'user@test.com',
  name: 'Test User',
  password: '$2a$12$hashedpassword',
  role: Role.USER,
  reservations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: 'password',
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('password');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: user.id, email: user.email }),
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: user.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not expose password in response', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: 'password',
      });
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('register', () => {
    it('should register and return token + user', async () => {
      const created = mockUser();
      usersService.create.mockResolvedValue(created as any);

      const result = await service.register({
        email: 'new@test.com',
        name: 'New User',
        password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });
  });
});

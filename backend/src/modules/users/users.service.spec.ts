/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
// backend/src/modules/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Role } from '../../common/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(UsersRepository);
  });

  describe('create', () => {
    it('should hash password and save user', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockReturnValue({ email: 'u@t.com' } as any);
      repo.save.mockResolvedValue({
        id: 'uuid',
        email: 'u@t.com',
        name: 'Test',
        password: 'hashed',
        role: Role.USER,
        reservations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.create({
        email: 'u@t.com',
        name: 'Test',
        password: 'plaintext',
      });

      expect(result.email).toBe('u@t.com');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(
        service.create({ email: 'dup@t.com', name: 'Dup', password: 'pass' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      const user = { id: 'uid', email: 'u@t.com' } as any;
      repo.findByEmail.mockResolvedValue(user);
      const result = await service.findByEmail('u@t.com');
      expect(result).toEqual(user);
      expect(repo.findByEmail).toHaveBeenCalledWith('u@t.com');
    });

    it('should return null when user not found by email', async () => {
      repo.findByEmail.mockResolvedValue(null);
      const result = await service.findByEmail('missing@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: 'uid', email: 'u@t.com' } as any;
      repo.findById.mockResolvedValue(user);
      const result = await service.findById('uid');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

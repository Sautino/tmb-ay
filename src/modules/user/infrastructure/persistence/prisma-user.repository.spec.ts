import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from 'src/shared';
import { User } from '../../domain';
import { UserDto } from '../../application/model';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockUserDto: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: UserDto[] = [
        mockUserDto,
        { ...mockUserDto, id: 'user-456', email: 'other@example.com' },
      ];
      prismaService.user.findMany.mockResolvedValue(users);

      const result = await repository.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.user.findMany.mockRejectedValue(dbError);

      await expect(repository.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('find', () => {
    it('should return user when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserDto);

      const result = await repository.find('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUserDto);
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.find('non-existent-id');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Database error');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(repository.find('user-123')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when email found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserDto);

      const result = await repository.findByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUserDto);
    });

    it('should return null when email not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'unknown@example.com' },
      });
      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Database error');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(
        repository.findByEmail('test@example.com'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create user and return UserDto', async () => {
      const user = User.create('test@example.com', 'Test User');
      prismaService.user.create.mockResolvedValue(mockUserDto);

      const result = await repository.create(user);

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          name: 'Test User',
        }),
      });
      expect(result).toEqual(mockUserDto);
    });

    it('should pass correct data structure to Prisma', async () => {
      const user = User.create('new@example.com', 'New User');
      prismaService.user.create.mockResolvedValue(mockUserDto);

      await repository.create(user);

      const createCall = prismaService.user.create.mock.calls[0][0];
      expect(createCall.data).toHaveProperty('email', 'new@example.com');
      expect(createCall.data).toHaveProperty('name', 'New User');
      expect(createCall.data).toHaveProperty('createdAt');
      expect(createCall.data).toHaveProperty('updatedAt');
    });

    it('should propagate database errors', async () => {
      const user = User.create('test@example.com', 'Test User');
      const dbError = new Error('Unique constraint violation');
      prismaService.user.create.mockRejectedValue(dbError);

      await expect(repository.create(user)).rejects.toThrow(
        'Unique constraint violation',
      );
    });
  });

  describe('update', () => {
    it('should update user and return UserDto', async () => {
      const user = User.rehydrate({
        id: 'user-123',
        email: 'updated@example.com',
        name: 'Updated User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
      const updatedDto = {
        ...mockUserDto,
        email: 'updated@example.com',
        name: 'Updated User',
      };
      prismaService.user.update.mockResolvedValue(updatedDto);

      const result = await repository.update(user);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          email: 'updated@example.com',
          name: 'Updated User',
        }),
      });
      expect(result).toEqual(updatedDto);
    });

    it('should use correct user ID in where clause', async () => {
      const user = User.rehydrate({
        id: 'specific-id-789',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prismaService.user.update.mockResolvedValue(mockUserDto);

      await repository.update(user);

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'specific-id-789' },
        }),
      );
    });

    it('should propagate database errors', async () => {
      const user = User.rehydrate({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const dbError = new Error('Record not found');
      prismaService.user.update.mockRejectedValue(dbError);

      await expect(repository.update(user)).rejects.toThrow('Record not found');
    });
  });

  describe('delete', () => {
    it('should delete user and return deleted UserDto', async () => {
      prismaService.user.delete.mockResolvedValue(mockUserDto);

      const result = await repository.delete('user-123');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUserDto);
    });

    it('should use correct ID in where clause', async () => {
      prismaService.user.delete.mockResolvedValue(mockUserDto);

      await repository.delete('specific-delete-id');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'specific-delete-id' },
      });
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Record to delete not found');
      prismaService.user.delete.mockRejectedValue(dbError);

      await expect(repository.delete('user-123')).rejects.toThrow(
        'Record to delete not found',
      );
    });
  });
});

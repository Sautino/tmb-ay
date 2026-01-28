import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from 'src/shared';
import { USER_REPOSITORY } from '../port';
import { UserDto } from '../model';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma-user.repository';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
  InvalidEmailException,
} from '../../domain';

// Commands
import { CreateUserCommand } from './command/create-user/create-user.command';
import { CreateUserHandler } from './command/create-user/create-user.handler';
import { UpdateUserCommand } from './command/update-user/update-user.command';
import { UpdateUserHandler } from './command/update-user/update-user.handler';
import { DeleteUserCommand } from './command/delete-user/delete-user.command';
import { DeleteUserHandler } from './command/delete-user/delete-user.handler';

// Queries
import { GetUserQuery } from './query/get-user/get-user.query';
import { GetUserHandler } from './query/get-user/get-user.handler';
import { GetAllUserQuery } from './query/get-all-user/get-all-user.query';
import { GetAllUserHandler } from './query/get-all-user/get-all-user.handler';
import { GetUserByEmailQuery } from './query/get-user-by-email/get-user-by-email.query';
import { GetUserByEmailHandler } from './query/get-user-by-email/get-user-by-email.handler';

describe('User Module Integration Tests', () => {
  let module: TestingModule;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let mockPrismaService: {
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
    mockPrismaService = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        // Command Handlers
        CreateUserHandler,
        UpdateUserHandler,
        DeleteUserHandler,
        // Query Handlers
        GetUserHandler,
        GetAllUserHandler,
        GetUserByEmailHandler,
        // Real Repository with mocked Prisma
        {
          provide: USER_REPOSITORY,
          useClass: PrismaUserRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    // Initialize the module to trigger onModuleInit lifecycle hooks
    await module.init();

    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  describe('CreateUserHandler Integration', () => {
    it('should create user through full CQRS chain', async () => {
      // GetUserByEmailQuery returns null (no existing user)
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      // Repository create returns the new user
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUserDto,
        email: 'newuser@example.com',
        name: 'New User',
      });

      const result = await commandBus.execute(
        new CreateUserCommand('newuser@example.com', 'New User'),
      );

      // Verify QueryBus was used to check email existence
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      });
      // Verify repository create was called
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(result.email).toBe('newuser@example.com');
      expect(result.name).toBe('New User');
    });

    it('should throw UserAlreadyExistsException when email exists via QueryBus chain', async () => {
      // GetUserByEmailQuery → GetUserByEmailHandler → Repository.findByEmail returns existing user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserDto);

      await expect(
        commandBus.execute(new CreateUserCommand('test@example.com', 'Test User')),
      ).rejects.toThrow(UserAlreadyExistsException);

      // Verify email check was performed
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      // Verify create was NOT called
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidEmailException before reaching repository', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        commandBus.execute(new CreateUserCommand('invalid-email', 'Test User')),
      ).rejects.toThrow(InvalidEmailException);

      // Verify repository create was NOT called due to domain validation
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should transform User entity to DTO through repository', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockImplementation((args) => {
        return Promise.resolve({
          id: 'generated-id',
          email: args.data.email,
          name: args.data.name,
          createdAt: args.data.createdAt,
          updatedAt: args.data.updatedAt,
        });
      });

      const result = await commandBus.execute(
        new CreateUserCommand('transform@example.com', 'Transform Test'),
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'transform@example.com');
      expect(result).toHaveProperty('name', 'Transform Test');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('UpdateUserHandler Integration', () => {
    it('should update user through full CQRS chain', async () => {
      // GetUserQuery → GetUserHandler → Repository.find returns existing user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserDto);
      // Repository update returns updated user
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUserDto,
        email: 'updated@example.com',
        name: 'Updated Name',
      });

      const result = await commandBus.execute(
        new UpdateUserCommand('user-123', 'updated@example.com', 'Updated Name'),
      );

      // Verify QueryBus was used to fetch user
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      // Verify repository update was called with correct ID
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
        }),
      );
      expect(result.email).toBe('updated@example.com');
      expect(result.name).toBe('Updated Name');
    });

    it('should throw UserNotFoundException when user does not exist via QueryBus chain', async () => {
      // GetUserQuery → GetUserHandler → Repository.find returns null
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        commandBus.execute(
          new UpdateUserCommand('non-existent-id', 'new@example.com', 'New Name'),
        ),
      ).rejects.toThrow(UserNotFoundException);

      // Verify existence check was performed
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      // Verify update was NOT called
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should validate email through domain entity before repository update', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserDto);

      await expect(
        commandBus.execute(
          new UpdateUserCommand('user-123', 'invalid-email', 'New Name'),
        ),
      ).rejects.toThrow(InvalidEmailException);

      // Verify user was fetched
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      // Verify update was NOT called due to domain validation
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should rehydrate entity from DTO and preserve createdAt', async () => {
      const originalCreatedAt = new Date('2024-01-01');
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUserDto,
        createdAt: originalCreatedAt,
      });
      mockPrismaService.user.update.mockImplementation((args) => {
        return Promise.resolve({
          id: 'user-123',
          email: args.data.email,
          name: args.data.name,
          createdAt: args.data.createdAt,
          updatedAt: args.data.updatedAt,
        });
      });

      const result = await commandBus.execute(
        new UpdateUserCommand('user-123', undefined, 'Only Name Update'),
      );

      // Verify createdAt is preserved from original entity
      const updateCall = mockPrismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.createdAt).toEqual(originalCreatedAt);
      expect(result.name).toBe('Only Name Update');
    });
  });

  describe('DeleteUserHandler Integration', () => {
    it('should delete user through full CQRS chain', async () => {
      // GetUserQuery → GetUserHandler → Repository.find returns existing user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserDto);
      mockPrismaService.user.delete.mockResolvedValue(mockUserDto);

      await commandBus.execute(new DeleteUserCommand('user-123'));

      // Verify QueryBus was used to check existence
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      // Verify repository delete was called
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw UserNotFoundException when user does not exist via QueryBus chain', async () => {
      // GetUserQuery → GetUserHandler → Repository.find returns null
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        commandBus.execute(new DeleteUserCommand('non-existent-id')),
      ).rejects.toThrow(UserNotFoundException);

      // Verify existence check was performed
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      // Verify delete was NOT called
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('Query Handlers Integration', () => {
    describe('GetUserHandler', () => {
      it('should return user through QueryBus → Handler → Repository chain', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUserDto);

        const result = await queryBus.execute(new GetUserQuery('user-123'));

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user-123' },
        });
        expect(result).toEqual(mockUserDto);
      });

      it('should return null when user not found', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const result = await queryBus.execute(new GetUserQuery('non-existent'));

        expect(result).toBeNull();
      });
    });

    describe('GetAllUserHandler', () => {
      it('should return all users through QueryBus → Handler → Repository chain', async () => {
        const users = [
          mockUserDto,
          { ...mockUserDto, id: 'user-456', email: 'other@example.com' },
        ];
        mockPrismaService.user.findMany.mockResolvedValue(users);

        const result = await queryBus.execute(new GetAllUserQuery());

        expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual(users);
        expect(result).toHaveLength(2);
      });

      it('should return empty array when no users exist', async () => {
        mockPrismaService.user.findMany.mockResolvedValue([]);

        const result = await queryBus.execute(new GetAllUserQuery());

        expect(result).toEqual([]);
      });
    });

    describe('GetUserByEmailHandler', () => {
      it('should return user by email through QueryBus → Handler → Repository chain', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUserDto);

        const result = await queryBus.execute(
          new GetUserByEmailQuery('test@example.com'),
        );

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
        expect(result).toEqual(mockUserDto);
      });

      it('should return null when email not found', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        const result = await queryBus.execute(
          new GetUserByEmailQuery('unknown@example.com'),
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Full CRUD Flow Integration', () => {
    it('should support complete user lifecycle: create → read → update → delete', async () => {
      // Step 1: Create user
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // Email check
      const createdUser = {
        id: 'lifecycle-user-id',
        email: 'lifecycle@example.com',
        name: 'Lifecycle User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const createResult = await commandBus.execute(
        new CreateUserCommand('lifecycle@example.com', 'Lifecycle User'),
      );
      expect(createResult.id).toBe('lifecycle-user-id');

      // Step 2: Read user
      mockPrismaService.user.findUnique.mockResolvedValueOnce(createdUser);
      const readResult = await queryBus.execute(
        new GetUserQuery('lifecycle-user-id'),
      );
      expect(readResult).toEqual(createdUser);

      // Step 3: Update user
      mockPrismaService.user.findUnique.mockResolvedValueOnce(createdUser);
      const updatedUser = {
        ...createdUser,
        name: 'Updated Lifecycle User',
        updatedAt: new Date(),
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const updateResult = await commandBus.execute(
        new UpdateUserCommand('lifecycle-user-id', undefined, 'Updated Lifecycle User'),
      );
      expect(updateResult.name).toBe('Updated Lifecycle User');

      // Step 4: Delete user
      mockPrismaService.user.findUnique.mockResolvedValueOnce(updatedUser);
      mockPrismaService.user.delete.mockResolvedValue(updatedUser);

      await commandBus.execute(new DeleteUserCommand('lifecycle-user-id'));
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'lifecycle-user-id' },
      });
    });
  });
});

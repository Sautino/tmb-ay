import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { UpdateUserHandler } from './update-user.handler';
import { UpdateUserCommand } from './update-user.command';
import { USER_REPOSITORY, UserRepository } from '../../../port';
import { UserDto } from '../../../model';
import { GetUserQuery } from '../../query';
import { UserNotFoundException, InvalidEmailException } from 'src/modules/user/domain';

describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let queryBus: jest.Mocked<QueryBus>;

  const mockUserDto: UserDto = {
    id: 'user-123',
    email: 'original@example.com',
    name: 'Original User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<UserRepository> = {
      findAll: jest.fn(),
      find: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    handler = module.get<UpdateUserHandler>(UpdateUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update user email successfully', async () => {
      const command = new UpdateUserCommand('user-123', 'newemail@example.com');
      const updatedUserDto: UserDto = {
        ...mockUserDto,
        email: 'newemail@example.com',
        updatedAt: new Date(),
      };

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.update.mockResolvedValue(updatedUserDto);

      const result = await handler.execute(command);

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserQuery),
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const updatedUserArg = userRepository.update.mock.calls[0][0];
      expect(updatedUserArg.email.getValue()).toBe('newemail@example.com');
      expect(result.email).toBe('newemail@example.com');
    });

    it('should update user name successfully', async () => {
      const command = new UpdateUserCommand('user-123', undefined, 'New Name');
      const updatedUserDto: UserDto = {
        ...mockUserDto,
        name: 'New Name',
        updatedAt: new Date(),
      };

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.update.mockResolvedValue(updatedUserDto);

      const result = await handler.execute(command);

      expect(userRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            name: 'New Name',
          }),
        }),
      );
      expect(result.name).toBe('New Name');
    });

    it('should update both email and name successfully', async () => {
      const command = new UpdateUserCommand(
        'user-123',
        'updated@example.com',
        'Updated Name',
      );
      const updatedUserDto: UserDto = {
        ...mockUserDto,
        email: 'updated@example.com',
        name: 'Updated Name',
        updatedAt: new Date(),
      };

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.update.mockResolvedValue(updatedUserDto);

      const result = await handler.execute(command);

      expect(result.email).toBe('updated@example.com');
      expect(result.name).toBe('Updated Name');
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      const command = new UpdateUserCommand('non-existent-id', 'test@example.com');

      queryBus.execute.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'non-existent-id' }),
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InvalidEmailException when new email format is invalid', async () => {
      const command = new UpdateUserCommand('user-123', 'invalid-email');

      queryBus.execute.mockResolvedValue(mockUserDto);

      await expect(handler.execute(command)).rejects.toThrow(
        InvalidEmailException,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should not update anything if no email or name provided', async () => {
      const command = new UpdateUserCommand('user-123');

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.update.mockResolvedValue(mockUserDto);

      const result = await handler.execute(command);

      expect(userRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockUserDto);
    });

    it('should propagate repository errors', async () => {
      const command = new UpdateUserCommand('user-123', 'test@example.com');
      const repositoryError = new Error('Database connection failed');

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.update.mockRejectedValue(repositoryError);

      await expect(handler.execute(command)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should preserve original createdAt when updating', async () => {
      const command = new UpdateUserCommand('user-123', undefined, 'New Name');
      const originalCreatedAt = new Date('2024-01-01');

      queryBus.execute.mockResolvedValue({
        ...mockUserDto,
        createdAt: originalCreatedAt,
      });
      userRepository.update.mockImplementation(async (user) => ({
        id: user.id.toString(),
        email: user.email.getValue(),
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      const result = await handler.execute(command);

      expect(result.createdAt).toEqual(originalCreatedAt);
    });
  });
});

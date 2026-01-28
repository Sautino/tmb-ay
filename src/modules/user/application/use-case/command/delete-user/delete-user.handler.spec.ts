import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { DeleteUserHandler } from './delete-user.handler';
import { DeleteUserCommand } from './delete-user.command';
import { USER_REPOSITORY, UserRepository } from '../../../port';
import { UserDto } from '../../../model';
import { GetUserQuery } from '../../query';
import { UserNotFoundException } from 'src/modules/user/domain';

describe('DeleteUserHandler', () => {
  let handler: DeleteUserHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let queryBus: jest.Mocked<QueryBus>;

  const mockUserDto: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
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
        DeleteUserHandler,
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

    handler = module.get<DeleteUserHandler>(DeleteUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete user successfully when user exists', async () => {
      const command = new DeleteUserCommand('user-123');

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.delete.mockResolvedValue(mockUserDto);

      await handler.execute(command);

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserQuery),
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
      );
      expect(userRepository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      const command = new DeleteUserCommand('non-existent-id');

      queryBus.execute.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'non-existent-id' }),
      );
      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should return void on successful deletion', async () => {
      const command = new DeleteUserCommand('user-123');

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.delete.mockResolvedValue(mockUserDto);

      const result = await handler.execute(command);

      expect(result).toBeUndefined();
    });

    it('should propagate repository errors', async () => {
      const command = new DeleteUserCommand('user-123');
      const repositoryError = new Error('Database connection failed');

      queryBus.execute.mockResolvedValue(mockUserDto);
      userRepository.delete.mockRejectedValue(repositoryError);

      await expect(handler.execute(command)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should call delete with the correct user id', async () => {
      const userId = 'specific-user-id-456';
      const command = new DeleteUserCommand(userId);

      queryBus.execute.mockResolvedValue({ ...mockUserDto, id: userId });
      userRepository.delete.mockResolvedValue({ ...mockUserDto, id: userId });

      await handler.execute(command);

      expect(userRepository.delete).toHaveBeenCalledTimes(1);
      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should check user existence before attempting deletion', async () => {
      const command = new DeleteUserCommand('user-123');
      const callOrder: string[] = [];

      queryBus.execute.mockImplementation(async () => {
        callOrder.push('queryBus.execute');
        return mockUserDto;
      });
      userRepository.delete.mockImplementation(async () => {
        callOrder.push('userRepository.delete');
        return mockUserDto;
      });

      await handler.execute(command);

      // Verify the order of operations
      expect(callOrder).toEqual(['queryBus.execute', 'userRepository.delete']);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from './create-user.command';
import { USER_REPOSITORY, UserRepository } from '../../../port';
import { UserDto } from '../../../model';
import { GetUserByEmailQuery } from '../../query';
import {
  UserAlreadyExistsException,
  InvalidEmailException,
} from 'src/modules/user/domain';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
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
        CreateUserHandler,
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

    handler = module.get<CreateUserHandler>(CreateUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a new user successfully when email does not exist', async () => {
      const command = new CreateUserCommand('newuser@example.com', 'New User');

      queryBus.execute.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        ...mockUserDto,
        email: 'newuser@example.com',
        name: 'New User',
      });

      const result = await handler.execute(command);

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserByEmailQuery),
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newuser@example.com' }),
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            name: 'New User',
          }),
        }),
      );
      expect(result).toEqual({
        ...mockUserDto,
        email: 'newuser@example.com',
        name: 'New User',
      });
    });

    it('should throw UserAlreadyExistsException when user with email already exists', async () => {
      const command = new CreateUserCommand(
        'existing@example.com',
        'Test User',
      );

      queryBus.execute.mockResolvedValue(mockUserDto);

      await expect(handler.execute(command)).rejects.toThrow(
        UserAlreadyExistsException,
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'existing@example.com' }),
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidEmailException when email format is invalid', async () => {
      const command = new CreateUserCommand('invalid-email', 'Test User');

      queryBus.execute.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(
        InvalidEmailException,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should call repository create with correct user entity', async () => {
      const command = new CreateUserCommand('valid@example.com', 'Valid User');

      queryBus.execute.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUserDto);

      await handler.execute(command);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      const createdUserArg = userRepository.create.mock.calls[0][0];
      expect(createdUserArg.email.getValue()).toBe('valid@example.com');
      expect(createdUserArg.name).toBe('Valid User');
    });

    it('should propagate repository errors', async () => {
      const command = new CreateUserCommand('test@example.com', 'Test User');
      const repositoryError = new Error('Database connection failed');

      queryBus.execute.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(repositoryError);

      await expect(handler.execute(command)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});

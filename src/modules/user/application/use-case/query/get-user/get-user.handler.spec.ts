import { Test, TestingModule } from '@nestjs/testing';
import { GetUserHandler } from './get-user.handler';
import { GetUserQuery } from './get-user.query';
import { USER_REPOSITORY, UserRepository } from '../../../port';
import { UserDto } from '../../../model';

describe('GetUserHandler', () => {
  let handler: GetUserHandler;
  let userRepository: jest.Mocked<UserRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserHandler>(GetUserHandler);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return user when user exists', async () => {
      const query = new GetUserQuery('user-123');

      userRepository.find.mockResolvedValue(mockUserDto);

      const result = await handler.execute(query);

      expect(userRepository.find).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUserDto);
    });

    it('should return null when user does not exist', async () => {
      const query = new GetUserQuery('non-existent-id');

      userRepository.find.mockResolvedValue(null);

      const result = await handler.execute(query);

      expect(userRepository.find).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });

    it('should call repository find with correct id', async () => {
      const userId = 'specific-user-id-789';
      const query = new GetUserQuery(userId);

      userRepository.find.mockResolvedValue(null);

      await handler.execute(query);

      expect(userRepository.find).toHaveBeenCalledTimes(1);
      expect(userRepository.find).toHaveBeenCalledWith(userId);
    });

    it('should return complete user data with all fields', async () => {
      const query = new GetUserQuery('user-123');
      const completeUserDto: UserDto = {
        id: 'user-123',
        email: 'complete@example.com',
        name: 'Complete User',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-02-20T15:45:00Z'),
      };

      userRepository.find.mockResolvedValue(completeUserDto);

      const result = await handler.execute(query);

      expect(result).toEqual(completeUserDto);
      expect(result?.id).toBe('user-123');
      expect(result?.email).toBe('complete@example.com');
      expect(result?.name).toBe('Complete User');
      expect(result?.createdAt).toEqual(new Date('2024-01-15T10:30:00Z'));
      expect(result?.updatedAt).toEqual(new Date('2024-02-20T15:45:00Z'));
    });

    it('should propagate repository errors', async () => {
      const query = new GetUserQuery('user-123');
      const repositoryError = new Error('Database connection failed');

      userRepository.find.mockRejectedValue(repositoryError);

      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle empty string id', async () => {
      const query = new GetUserQuery('');

      userRepository.find.mockResolvedValue(null);

      const result = await handler.execute(query);

      expect(userRepository.find).toHaveBeenCalledWith('');
      expect(result).toBeNull();
    });
  });
});

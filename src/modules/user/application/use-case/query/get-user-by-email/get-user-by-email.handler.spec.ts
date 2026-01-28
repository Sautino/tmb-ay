import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByEmailHandler } from './get-user-by-email.handler';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { USER_REPOSITORY, UserRepository } from '../../../port';
import { UserDto } from '../../../model';

describe('GetUserByEmailHandler', () => {
  let handler: GetUserByEmailHandler;
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
        GetUserByEmailHandler,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserByEmailHandler>(GetUserByEmailHandler);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return user when user with email exists', async () => {
      const query = new GetUserByEmailQuery('test@example.com');

      userRepository.findByEmail.mockResolvedValue(mockUserDto);

      const result = await handler.execute(query);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUserDto);
    });

    it('should return null when user with email does not exist', async () => {
      const query = new GetUserByEmailQuery('nonexistent@example.com');

      userRepository.findByEmail.mockResolvedValue(null);

      const result = await handler.execute(query);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should call repository findByEmail with correct email', async () => {
      const email = 'specific@email.com';
      const query = new GetUserByEmailQuery(email);

      userRepository.findByEmail.mockResolvedValue(null);

      await handler.execute(query);

      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return complete user data with all fields', async () => {
      const query = new GetUserByEmailQuery('complete@example.com');
      const completeUserDto: UserDto = {
        id: 'user-456',
        email: 'complete@example.com',
        name: 'Complete User',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-02-20T15:45:00Z'),
      };

      userRepository.findByEmail.mockResolvedValue(completeUserDto);

      const result = await handler.execute(query);

      expect(result).toEqual(completeUserDto);
      expect(result?.id).toBe('user-456');
      expect(result?.email).toBe('complete@example.com');
      expect(result?.name).toBe('Complete User');
    });

    it('should propagate repository errors', async () => {
      const query = new GetUserByEmailQuery('test@example.com');
      const repositoryError = new Error('Database connection failed');

      userRepository.findByEmail.mockRejectedValue(repositoryError);

      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle email with different formats', async () => {
      const emails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
      ];

      for (const email of emails) {
        const query = new GetUserByEmailQuery(email);
        userRepository.findByEmail.mockResolvedValue({ ...mockUserDto, email });

        const result = await handler.execute(query);

        expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
        expect(result?.email).toBe(email);
      }
    });

    it('should be case-sensitive for email lookup', async () => {
      const query = new GetUserByEmailQuery('Test@Example.com');

      userRepository.findByEmail.mockResolvedValue(null);

      await handler.execute(query);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('Test@Example.com');
    });
  });
});

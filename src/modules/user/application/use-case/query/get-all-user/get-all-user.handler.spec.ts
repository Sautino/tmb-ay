import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUserHandler } from './get-all-user.handler';
import { GetAllUserQuery } from './get-all-user.query';
import { USER_REPOSITORY, UserRepository } from '../../../port';
import { UserDto } from '../../../model';

describe('GetAllUserHandler', () => {
  let handler: GetAllUserHandler;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUserDto: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUsersArray: UserDto[] = [
    mockUserDto,
    {
      id: 'user-456',
      email: 'another@example.com',
      name: 'Another User',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'user-789',
      email: 'third@example.com',
      name: 'Third User',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

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
        GetAllUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<GetAllUserHandler>(GetAllUserHandler);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all users when users exist', async () => {
      const query = new GetAllUserQuery();

      userRepository.findAll.mockResolvedValue(mockUsersArray);

      const result = await handler.execute(query);

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsersArray);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no users exist', async () => {
      const query = new GetAllUserQuery();

      userRepository.findAll.mockResolvedValue([]);

      const result = await handler.execute(query);

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return single user array when only one user exists', async () => {
      const query = new GetAllUserQuery();

      userRepository.findAll.mockResolvedValue([mockUserDto]);

      const result = await handler.execute(query);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUserDto);
    });

    it('should call repository findAll once', async () => {
      const query = new GetAllUserQuery();

      userRepository.findAll.mockResolvedValue(mockUsersArray);

      await handler.execute(query);

      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return users with complete data', async () => {
      const query = new GetAllUserQuery();

      userRepository.findAll.mockResolvedValue(mockUsersArray);

      const result = await handler.execute(query);

      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
      });
    });

    it('should propagate repository errors', async () => {
      const query = new GetAllUserQuery();
      const repositoryError = new Error('Database connection failed');

      userRepository.findAll.mockRejectedValue(repositoryError);

      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle large number of users', async () => {
      const query = new GetAllUserQuery();
      const largeUserArray: UserDto[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      userRepository.findAll.mockResolvedValue(largeUserArray);

      const result = await handler.execute(query);

      expect(result).toHaveLength(1000);
      expect(result[0].id).toBe('user-0');
      expect(result[999].id).toBe('user-999');
    });

    it('should preserve order of users from repository', async () => {
      const query = new GetAllUserQuery();
      const orderedUsers: UserDto[] = [
        { ...mockUserDto, id: 'first', name: 'First' },
        { ...mockUserDto, id: 'second', name: 'Second' },
        { ...mockUserDto, id: 'third', name: 'Third' },
      ];

      userRepository.findAll.mockResolvedValue(orderedUsers);

      const result = await handler.execute(query);

      expect(result[0].id).toBe('first');
      expect(result[1].id).toBe('second');
      expect(result[2].id).toBe('third');
    });
  });
});

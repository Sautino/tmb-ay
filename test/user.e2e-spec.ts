import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { USER_REPOSITORY } from './../src/modules/user/application';
import { UserDto } from './../src/modules/user/application/model';
import { UserRepository } from './../src/modules/user/application/port';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUsers: UserDto[] = [
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'user-2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    mockUserRepository = {
      findAll: jest.fn(),
      find: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      });
      expect(response.body[1]).toMatchObject({
        id: 'user-2',
        email: 'jane@example.com',
        name: 'Jane Smith',
      });
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsers[0]);

      const response = await request(app.getHttpServer())
        .get('/users/user-1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      });
      expect(mockUserRepository.find).toHaveBeenCalledWith('user-1');
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.find.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser: UserDto = {
        id: 'user-3',
        email: 'newuser@example.com',
        name: 'New User',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'newuser@example.com', name: 'New User' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'user-3',
        email: 'newuser@example.com',
        name: 'New User',
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should return 500 when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUsers[0]);

      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'john@example.com', name: 'Another John' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should return 500 when email format is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'invalid-email', name: 'Test User' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user name', async () => {
      const updatedUser: UserDto = {
        ...mockUsers[0],
        name: 'John Updated',
        updatedAt: new Date('2024-01-10'),
      };

      mockUserRepository.find.mockResolvedValue(mockUsers[0]);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .put('/users/user-1')
        .send({ name: 'John Updated' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'user-1',
        name: 'John Updated',
      });
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('should update user email', async () => {
      const updatedUser: UserDto = {
        ...mockUsers[0],
        email: 'john.updated@example.com',
        updatedAt: new Date('2024-01-10'),
      };

      mockUserRepository.find.mockResolvedValue(mockUsers[0]);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .put('/users/user-1')
        .send({ email: 'john.updated@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'user-1',
        email: 'john.updated@example.com',
      });
    });

    it('should update both name and email', async () => {
      const updatedUser: UserDto = {
        ...mockUsers[0],
        email: 'john.new@example.com',
        name: 'John New',
        updatedAt: new Date('2024-01-10'),
      };

      mockUserRepository.find.mockResolvedValue(mockUsers[0]);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .put('/users/user-1')
        .send({ email: 'john.new@example.com', name: 'John New' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'user-1',
        email: 'john.new@example.com',
        name: 'John New',
      });
    });

    it('should return 500 when user not found', async () => {
      mockUserRepository.find.mockResolvedValue(null);

      await request(app.getHttpServer())
        .put('/users/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return 500 when updating to invalid email', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsers[0]);

      await request(app.getHttpServer())
        .put('/users/user-1')
        .send({ email: 'not-an-email' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsers[0]);
      mockUserRepository.delete.mockResolvedValue(mockUsers[0]);

      await request(app.getHttpServer()).delete('/users/user-1').expect(200);

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-1');
    });

    it('should return 500 when user not found', async () => {
      mockUserRepository.find.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});

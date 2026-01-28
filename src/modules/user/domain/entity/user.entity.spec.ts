import { User } from './user.entity';
import { Email } from '../value-object';
import { InvalidEmailException } from '../exception';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user with valid email and name', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(user).toBeInstanceOf(User);
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should set createdAt and updatedAt to the same value on creation', () => {
      const beforeCreate = new Date();
      const user = User.create('test@example.com', 'Test User');
      const afterCreate = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });

    it('should generate a unique ID', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
    });

    it('should throw InvalidEmailException for invalid email', () => {
      expect(() => User.create('invalid-email', 'Test User')).toThrow(
        InvalidEmailException,
      );
    });
  });

  describe('rehydrate', () => {
    it('should reconstruct a user from DTO with existing ID', () => {
      const dto = {
        id: 'existing-id-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      const user = User.rehydrate(dto);

      expect(user.id).toBe('existing-id-123');
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(user.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'));
    });

    it('should handle string dates and convert them to Date objects', () => {
      const dto = {
        id: 'existing-id-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z' as unknown as Date,
        updatedAt: '2024-01-02T00:00:00Z' as unknown as Date,
      };

      const user = User.rehydrate(dto);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(user.updatedAt.toISOString()).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should throw InvalidEmailException for invalid email in DTO', () => {
      const dto = {
        id: 'existing-id-123',
        email: 'invalid-email',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => User.rehydrate(dto)).toThrow(InvalidEmailException);
    });
  });

  describe('updateEmail', () => {
    it('should update the email', () => {
      const user = User.create('old@example.com', 'Test User');

      user.updateEmail('new@example.com');

      expect(user.email.getValue()).toBe('new@example.com');
    });

    it('should update the updatedAt timestamp', () => {
      const user = User.create('test@example.com', 'Test User');
      const originalUpdatedAt = user.updatedAt;

      // Small delay to ensure timestamp difference
      const later = new Date(originalUpdatedAt.getTime() + 1);
      jest.useFakeTimers().setSystemTime(later);

      user.updateEmail('new@example.com');

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      jest.useRealTimers();
    });

    it('should throw InvalidEmailException for invalid email', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(() => user.updateEmail('invalid-email')).toThrow(
        InvalidEmailException,
      );
    });

    it('should not update updatedAt when email update fails', () => {
      const user = User.create('test@example.com', 'Test User');
      const originalUpdatedAt = user.updatedAt;

      try {
        user.updateEmail('invalid-email');
      } catch {
        // Expected to throw
      }

      expect(user.updatedAt.getTime()).toBe(originalUpdatedAt.getTime());
    });
  });

  describe('updateName', () => {
    it('should update the name', () => {
      const user = User.create('test@example.com', 'Old Name');

      user.updateName('New Name');

      expect(user.name).toBe('New Name');
    });

    it('should update the updatedAt timestamp', () => {
      const user = User.create('test@example.com', 'Test User');
      const originalUpdatedAt = user.updatedAt;

      // Small delay to ensure timestamp difference
      const later = new Date(originalUpdatedAt.getTime() + 1);
      jest.useFakeTimers().setSystemTime(later);

      user.updateName('New Name');

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      jest.useRealTimers();
    });
  });

  describe('getters', () => {
    it('should return email as Email value object', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(user.email).toBeInstanceOf(Email);
    });

    it('should return name as string', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(user.name).toBe('Test User');
    });

    it('should return createdAt as Date', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should return updatedAt as Date', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return data with all properties', () => {
      const user = User.create('test@example.com', 'Test User');
      const data = user.data;

      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
      expect(data.email).toBeInstanceOf(Email);
      expect(data.name).toBe('Test User');
    });

    it('should return id as string', () => {
      const user = User.create('test@example.com', 'Test User');

      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
    });
  });
});

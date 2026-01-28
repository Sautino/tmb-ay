import { InvalidEmailException } from './invalid-email.exception';
import { UserAlreadyExistsException } from './user-already-exists.exception';
import { UserNotFoundException } from './user-not-found.exception';

describe('Domain Exceptions', () => {
  describe('InvalidEmailException', () => {
    it('should have the correct message', () => {
      const exception = new InvalidEmailException();

      expect(exception.message).toBe('The provided email is invalid.');
    });

    it('should have the correct name', () => {
      const exception = new InvalidEmailException();

      expect(exception.name).toBe('InvalidEmailException');
    });

    it('should be an instance of Error', () => {
      const exception = new InvalidEmailException();

      expect(exception).toBeInstanceOf(Error);
    });
  });

  describe('UserAlreadyExistsException', () => {
    it('should have the correct message', () => {
      const exception = new UserAlreadyExistsException();

      expect(exception.message).toBe(
        'A user with the given email already exists.',
      );
    });

    it('should have the correct name', () => {
      const exception = new UserAlreadyExistsException();

      expect(exception.name).toBe('UserAlreadyExistsException');
    });

    it('should be an instance of Error', () => {
      const exception = new UserAlreadyExistsException();

      expect(exception).toBeInstanceOf(Error);
    });
  });

  describe('UserNotFoundException', () => {
    it('should have the correct message', () => {
      const exception = new UserNotFoundException();

      expect(exception.message).toBe('User with the given ID not found');
    });

    it('should have the correct name', () => {
      const exception = new UserNotFoundException();

      expect(exception.name).toBe('UserNotFoundException');
    });

    it('should be an instance of Error', () => {
      const exception = new UserNotFoundException();

      expect(exception).toBeInstanceOf(Error);
    });
  });
});

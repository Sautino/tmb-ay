import { Email } from './email.vo';
import { InvalidEmailException } from '../exception';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create an Email with a valid email address', () => {
      const email = Email.create('test@example.com');

      expect(email).toBeInstanceOf(Email);
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should create an Email with complex valid formats', () => {
      const emailWithDots = Email.create('user.name@example.com');
      const emailWithPlus = Email.create('user+tag@example.com');
      const emailWithSubdomain = Email.create('user@mail.example.com');

      expect(emailWithDots.getValue()).toBe('user.name@example.com');
      expect(emailWithPlus.getValue()).toBe('user+tag@example.com');
      expect(emailWithSubdomain.getValue()).toBe('user@mail.example.com');
    });

    it('should throw InvalidEmailException for email without @', () => {
      expect(() => Email.create('invalid-email')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for email without domain', () => {
      expect(() => Email.create('user@')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for email without local part', () => {
      expect(() => Email.create('@example.com')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for email with spaces', () => {
      expect(() => Email.create('user @example.com')).toThrow(
        InvalidEmailException,
      );
      expect(() => Email.create('user@ example.com')).toThrow(
        InvalidEmailException,
      );
    });

    it('should throw InvalidEmailException for email without TLD', () => {
      expect(() => Email.create('user@example')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailException);
    });
  });

  describe('getValue', () => {
    it('should return the email string', () => {
      const email = Email.create('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for emails with the same value', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for emails with different values', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const email1 = Email.create('Test@example.com');
      const email2 = Email.create('test@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});

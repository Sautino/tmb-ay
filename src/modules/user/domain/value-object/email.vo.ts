import { InvalidEmailException } from '../exception';

export class Email {
  private readonly email: string;

  private constructor(email: string) {
    this.email = email;
  }

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new InvalidEmailException();
    }

    return new Email(email);
  }

  getValue(): string {
    return this.email;
  }

  equals(other: Email) {
    return this.email === other.email;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

export class UserAlreadyExistsException extends Error {
  constructor() {
    super('A user with the given email already exists.');
    this.name = 'UserAlreadyExistsException';
  }
}

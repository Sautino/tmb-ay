export class UserNotFoundException extends Error {
  constructor() {
    super(`User with the given ID not found`);
    this.name = 'UserNotFoundException';
  }
}

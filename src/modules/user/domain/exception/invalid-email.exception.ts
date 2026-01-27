export class InvalidEmailException extends Error {
  constructor() {
    super('The provided email is invalid.');
    this.name = 'InvalidEmailException';
  }
}

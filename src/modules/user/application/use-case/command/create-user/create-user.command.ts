export class CreateUserCommand {
  constructor(
    readonly email: string,
    readonly name: string,
  ) {}
}

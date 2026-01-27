export class UpdateUserCommand {
  constructor(
    readonly id: string,
    readonly email?: string,
    readonly name?: string,
  ) {}
}

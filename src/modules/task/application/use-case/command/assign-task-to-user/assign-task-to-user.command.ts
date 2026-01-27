export class AssignTaskToUserCommand {
  constructor(
    readonly id: string,
    readonly userId: string,
  ) {}
}

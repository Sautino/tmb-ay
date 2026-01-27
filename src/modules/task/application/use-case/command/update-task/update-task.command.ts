export class UpdateTaskCommand {
  constructor(
    readonly id: string,
    readonly title?: string,
    readonly description?: string,
    readonly completed?: boolean,
  ) {}
}

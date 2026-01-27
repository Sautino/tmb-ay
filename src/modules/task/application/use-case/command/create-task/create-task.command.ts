export class CreateTaskCommand {
  constructor(
    readonly title: string,
    readonly description?: string,
  ) {}
}

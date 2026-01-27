import { Entity, UniqueEntityID } from 'src/shared';

interface TaskProps {
  title: string;
  description?: string;
  completed: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Task extends Entity<TaskProps> {
  constructor(props: TaskProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(title: string, description?: string): Task {
    const now = new Date();
    return new Task({
      title,
      description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(task: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      {
        title: task.title,
        description: task.description || undefined,
        completed: task.completed,
        userId: task.userId || undefined,
        createdAt:
          task.createdAt instanceof Date
            ? task.createdAt
            : new Date(task.createdAt),
        updatedAt:
          task.updatedAt instanceof Date
            ? task.updatedAt
            : new Date(task.updatedAt),
      },
      new UniqueEntityID(task.id),
    );
  }

  assignToUser(userId: string) {
    this.props.userId = userId;
    this.props.updatedAt = new Date();
  }

  updateCompleted(completed: boolean) {
    this.props.completed = completed;
    this.props.updatedAt = new Date();
  }

  updateTitle(title: string) {
    this.props.title = title;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string) {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get completed(): boolean {
    return this.props.completed;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get data(): TaskProps {
    return this.props;
  }
}

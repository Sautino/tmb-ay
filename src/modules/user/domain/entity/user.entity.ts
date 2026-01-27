import { Entity, UniqueEntityID } from 'src/shared';
import { Email } from '../value-object';

interface UserProps {
  email: Email;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(email: string, name: string): User {
    const now = new Date();

    return new User({
      email: Email.create(email),
      name,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      {
        email: Email.create(user.email),
        name: user.name,
        createdAt:
          user.createdAt instanceof Date
            ? user.createdAt
            : new Date(user.createdAt),
        updatedAt:
          user.updatedAt instanceof Date
            ? user.updatedAt
            : new Date(user.updatedAt),
      },
      new UniqueEntityID(user.id),
    );
  }

  updateEmail(email: string) {
    this.props.email = Email.create(email);
    this.props.updatedAt = new Date();
  }

  updateName(name: string) {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get data(): UserProps {
    return this.props;
  }
}

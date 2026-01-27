import { UniqueEntityID } from './unique-entity-id';

export abstract class Entity<TProps> {
  protected readonly _id: UniqueEntityID;
  protected readonly props: TProps;

  constructor(props: TProps, id?: UniqueEntityID) {
    this._id = id ?? new UniqueEntityID();
    this.props = props;
  }

  get id(): string {
    return this._id.toString();
  }
}

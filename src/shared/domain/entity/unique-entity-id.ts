export class UniqueEntityID {
  constructor(private readonly value: string = crypto.randomUUID()) {}

  toString() {
    return this.value;
  }

  equals(other?: UniqueEntityID) {
    return !!other && this.value === other.value;
  }
}

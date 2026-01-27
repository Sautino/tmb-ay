import { User } from 'src/modules/user/domain';
import { UserDto } from '../../model';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findAll(): Promise<Array<UserDto>>;
  find(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
  create(user: User): Promise<UserDto>;
  update(user: User): Promise<UserDto>;
  delete(id: string): Promise<UserDto>;
}

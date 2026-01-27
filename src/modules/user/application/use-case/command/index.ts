export * from './create-user';
export * from './delete-user';
export * from './update-user';

import * as CreateUser from './create-user';
import * as DeleteUser from './delete-user';
import * as UpdateUser from './update-user';

export const USER_COMMAND_USE_CASES = [
  ...Object.values(CreateUser),
  ...Object.values(DeleteUser),
  ...Object.values(UpdateUser),
];

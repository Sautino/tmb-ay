export * from './get-all-user';
export * from './get-user';
export * from './get-user-by-email';

import * as GetAllUser from './get-all-user';
import * as GetUser from './get-user';
import * as GetUserByEmail from './get-user-by-email';

export const USER_QUERY_USE_CASES = [
  ...Object.values(GetAllUser),
  ...Object.values(GetUser),
  ...Object.values(GetUserByEmail),
];

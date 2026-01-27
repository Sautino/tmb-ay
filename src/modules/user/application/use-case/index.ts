import { USER_COMMAND_USE_CASES } from './command';
import { USER_QUERY_USE_CASES } from './query';

export const USER_USE_CASES = [
  ...USER_COMMAND_USE_CASES,
  ...USER_QUERY_USE_CASES,
];

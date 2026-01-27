import { TASK_COMMAND_USE_CASES } from './command';
import { TASK_QUERY_USE_CASES } from './query';

export const TASK_USE_CASES = [
  ...TASK_COMMAND_USE_CASES,
  ...TASK_QUERY_USE_CASES,
];

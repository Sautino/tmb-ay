export * from './get-task';
export * from './get-user-tasks';

import * as GetTask from './get-task';
import * as GetUserTasks from './get-user-tasks';

export const TASK_QUERY_USE_CASES = [
  ...Object.values(GetTask),
  ...Object.values(GetUserTasks),
];

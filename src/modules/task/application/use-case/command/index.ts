export * from './assign-task-to-user';
export * from './create-task';
export * from './delete-task';
export * from './update-task';

import * as AssignTaskToUser from './assign-task-to-user';
import * as CreateTask from './create-task';
import * as DeleteTask from './delete-task';
import * as UpdateTask from './update-task';

export const TASK_COMMAND_USE_CASES = [
  ...Object.values(AssignTaskToUser),
  ...Object.values(CreateTask),
  ...Object.values(DeleteTask),
  ...Object.values(UpdateTask),
];

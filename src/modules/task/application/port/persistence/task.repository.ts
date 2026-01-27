import { Task } from 'src/modules/task/domain';
import { TaskDto } from '../../model';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface TaskRepository {
  find(id: string): Promise<TaskDto | null>;
  findByUserId(userId: string): Promise<Array<TaskDto>>;
  create(task: Task): Promise<TaskDto>;
  update(task: Task): Promise<TaskDto>;
  delete(id: string): Promise<TaskDto>;
}

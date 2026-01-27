export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

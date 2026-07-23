export enum Priority {
  Lowest = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  Highest = 5,
}

export enum TaskItemStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum TaskSortField {
  CreatedAt = 'CreatedAt',
  DueDate = 'DueDate',
  Title = 'Title',
  Priority = 'Priority',
  Status = 'Status',
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskItemStatus;
  dueDate: string | null;
  completedAt: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  categoryId?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskItemStatus;
  dueDate?: string | null;
  categoryId?: string | null;
}

export interface TaskQueryParams {
  searchTerm?: string;
  priority?: Priority;
  status?: TaskItemStatus;
  categoryId?: string;
  dueDate?: string;

  sortBy?: TaskSortField;
  descending?: boolean;

  pageNumber?: number;
  pageSize?: number;
}

export interface TaskStatistics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  completionRate: number;
}

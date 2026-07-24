export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  comment: string;
}

export interface UpdateCommentRequest {
  comment: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

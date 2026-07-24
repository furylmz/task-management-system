import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Priority, TaskItem, TaskItemStatus } from '../../../core/models/task.model';
import { TaskComment } from '../../../core/models/comment.model';

import { TaskService } from '../../../core/services/task';
import { CategoryService } from '../../../core/services/category';
import { CommentService } from '../../../core/services/comment';
import { AuthService } from '../../../core/services/auth';
import { TaskAttachment } from '../../../core/models/attachment.model';
import { AttachmentService } from '../../../core/services/attachment';

import { PriorityLabelPipe } from '../../../shared/pipes/priority-label.pipe';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-task-detail',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    PriorityLabelPipe,
    StatusLabelPipe,
  ],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly commentService = inject(CommentService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly attachmentService = inject(AttachmentService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly task = signal<TaskItem | null>(null);
  readonly categoryName = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly comments = signal<TaskComment[]>([]);
  readonly isLoadingComments = signal(false);
  readonly isSavingComment = signal(false);
  readonly editingCommentId = signal<string | null>(null);
  readonly currentUserId = signal<string | null>(null);

  @ViewChild(FormGroupDirective) formDir!: FormGroupDirective;

  readonly attachments = signal<TaskAttachment[]>([]);
  readonly isLoadingAttachments = signal(false);
  readonly isUploading = signal(false);

  readonly commentForm = this.formBuilder.group({
    comment: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  readonly Priority = Priority;
  readonly TaskItemStatus = TaskItemStatus;

  private taskId: string | null = null;

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');

    if (!this.taskId) {
      this.errorMessage.set('Geçersiz görev kimliği.');
      return;
    }

    const user = this.authService.getCurrentUser();
    this.currentUserId.set(user?.id ?? null);

    this.loadTask(this.taskId);
    this.loadComments(this.taskId);
    this.loadAttachments(this.taskId);
  }

  private loadTask(taskId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getById(taskId)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (task) => {
          this.task.set(task);
          if (task.categoryId) {
            this.loadCategoryName(task.categoryId);
          }
        },
        error: (error) => {
          this.task.set(null);
          this.errorMessage.set(error.message);
        },
      });
  }

  private loadCategoryName(categoryId: string): void {
    this.categoryService
      .getById(categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (category) => this.categoryName.set(category.name),
        error: () => this.categoryName.set(null),
      });
  }

  private loadComments(taskId: string): void {
    this.isLoadingComments.set(true);

    this.commentService
      .getAll(taskId)
      .pipe(
        finalize(() => this.isLoadingComments.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (comments) => this.comments.set(comments),
        error: () => this.comments.set([]),
      });
  }

  startEditComment(comment: TaskComment): void {
    this.editingCommentId.set(comment.id);
    this.commentForm.setValue({ comment: comment.comment });
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.formDir.resetForm({ comment: '' });
  }

  saveComment(): void {
    if (this.commentForm.invalid || !this.taskId) {
      this.commentForm.markAllAsTouched();
      return;
    }

    if (this.editingCommentId()) {
      this.updateComment(this.editingCommentId()!);
    } else {
      this.createComment(this.taskId);
    }
  }

  private createComment(taskId: string): void {
    this.isSavingComment.set(true);

    this.commentService
      .create(taskId, {
        comment: this.commentForm.getRawValue().comment!,
      })
      .pipe(
        finalize(() => this.isSavingComment.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.formDir.resetForm({ comment: '' });
          this.loadComments(taskId);
          this.snackBar.open('Yorum eklendi.', 'Tamam', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Kapat', { duration: 4000 });
        },
      });
  }

  private updateComment(commentId: string): void {
    this.isSavingComment.set(true);

    this.commentService
      .update(commentId, {
        comment: this.commentForm.getRawValue().comment!,
      })
      .pipe(
        finalize(() => this.isSavingComment.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.cancelEditComment();
          this.loadComments(this.taskId!);
          this.snackBar.open('Yorum güncellendi.', 'Tamam', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Kapat', { duration: 4000 });
        },
      });
  }

  deleteComment(commentId: string): void {
    this.commentService
      .delete(commentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadComments(this.taskId!);
          this.snackBar.open('Yorum silindi.', 'Tamam', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Kapat', { duration: 4000 });
        },
      });
  }

  private loadAttachments(taskId: string): void {
    this.isLoadingAttachments.set(true);

    this.attachmentService
      .getAll(taskId)
      .pipe(
        finalize(() => this.isLoadingAttachments.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (attachments) => this.attachments.set(attachments),
        error: () => this.attachments.set([]),
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.taskId) return;

    this.uploadFile(file);
    input.value = '';
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);

    this.attachmentService
      .upload(this.taskId!, file)
      .pipe(
        finalize(() => this.isUploading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.loadAttachments(this.taskId!);
          this.snackBar.open('Dosya yüklendi.', 'Tamam', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Kapat', { duration: 4000 });
        },
      });
  }

  downloadAttachment(attachment: TaskAttachment): void {
    this.attachmentService
      .download(attachment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          // Tarayıcıya dosyayı indirt
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachment.fileName;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackBar.open('Dosya indirilemedi.', 'Kapat', { duration: 4000 });
        },
      });
  }

  deleteAttachment(attachmentId: string): void {
    this.attachmentService
      .delete(attachmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadAttachments(this.taskId!);
          this.snackBar.open('Dosya silindi.', 'Tamam', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Kapat', { duration: 4000 });
        },
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  editTask(): void {
    if (!this.taskId) return;
    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }
}

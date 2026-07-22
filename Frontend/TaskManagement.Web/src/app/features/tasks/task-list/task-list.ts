import { Component, inject, OnInit, signal } from '@angular/core';

import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { TaskItem } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task';
import { TaskCard } from '../task-card/task-card';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-task-list',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, TaskCard],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly tasks = signal<TaskItem[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isDeleting = signal(false);

  readonly pageNumber = signal(1);
  readonly pageSize = signal(12);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getAll({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.tasks.set(response.items);
          this.pageNumber.set(response.pageNumber);
          this.pageSize.set(response.pageSize);
          this.totalCount.set(response.totalCount);
          this.totalPages.set(response.totalPages);
        },
        error: (error) => {
          this.tasks.set([]);

          this.errorMessage.set(error?.error?.message ?? 'Görevler yüklenirken bir hata oluştu.');
        },
      });
  }

  createTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  showTaskDetails(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  editTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  deleteTask(taskId: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Görevi Sil',
      message: 'Bu görevi kalıcı olarak silmek istediğinize emin misiniz?',
      confirmText: 'Sil',
      cancelText: 'İptal',
    };

    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      width: '420px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.performDelete(taskId);
    });
  }
  private performDelete(taskId: string): void {
    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.taskService
      .delete(taskId)
      .pipe(
        finalize(() => {
          this.isDeleting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? 'Görev silinirken bir hata oluştu.');
        },
      });
  }
}

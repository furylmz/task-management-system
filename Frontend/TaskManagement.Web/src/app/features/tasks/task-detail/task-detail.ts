import { Component, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { DatePipe } from '@angular/common';

import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Priority, TaskItem, TaskItemStatus } from '../../../core/models/task.model';

import { TaskService } from '../../../core/services/task';

@Component({
  selector: 'app-task-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly task = signal<TaskItem | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly Priority = Priority;
  readonly TaskItemStatus = TaskItemStatus;

  private taskId: string | null = null;

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');

    if (!this.taskId) {
      this.errorMessage.set('Geçersiz görev kimliği.');
      return;
    }

    this.loadTask(this.taskId);
  }

  private loadTask(taskId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getById(taskId)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (task) => {
          this.task.set(task);
        },
        error: (error) => {
          this.task.set(null);

          this.errorMessage.set(
            error?.error?.message ?? 'Görev bilgileri yüklenirken bir hata oluştu.',
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  editTask(): void {
    if (!this.taskId) {
      return;
    }

    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case Priority.Lowest:
        return 'Çok Düşük';

      case Priority.Low:
        return 'Düşük';

      case Priority.Medium:
        return 'Orta';

      case Priority.High:
        return 'Yüksek';

      case Priority.Highest:
        return 'Çok Yüksek';

      default:
        return 'Bilinmiyor';
    }
  }

  getStatusLabel(status: TaskItemStatus): string {
    switch (status) {
      case TaskItemStatus.Pending:
        return 'Bekliyor';

      case TaskItemStatus.InProgress:
        return 'Devam Ediyor';

      case TaskItemStatus.Completed:
        return 'Tamamlandı';

      case TaskItemStatus.Cancelled:
        return 'İptal Edildi';

      default:
        return 'Bilinmiyor';
    }
  }
}

import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Router } from '@angular/router';

import { DatePipe, DecimalPipe } from '@angular/common';

import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TaskItem, TaskStatistics } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly taskService = inject(TaskService);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly statistics = signal<TaskStatistics | null>(null);
  readonly overdueTasks = signal<TaskItem[]>([]);

  readonly isLoadingStats = signal(false);
  readonly isLoadingOverdue = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStatistics();
    this.loadOverdueTasks();
  }

  private loadStatistics(): void {
    this.isLoadingStats.set(true);

    this.taskService
      .getStatistics()
      .pipe(
        finalize(() => this.isLoadingStats.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (stats) => this.statistics.set(stats),
        error: () => this.errorMessage.set('İstatistikler yüklenemedi.'),
      });
  }

  private loadOverdueTasks(): void {
    this.isLoadingOverdue.set(true);

    this.taskService
      .getOverdue()
      .pipe(
        finalize(() => this.isLoadingOverdue.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (tasks) => this.overdueTasks.set(tasks),
        error: () => this.overdueTasks.set([]),
      });
  }

  goToTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  goToTasks(): void {
    this.router.navigate(['/tasks']);
  }
}

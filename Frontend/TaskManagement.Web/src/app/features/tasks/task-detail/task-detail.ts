import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { DatePipe } from '@angular/common';

import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Priority, TaskItem, TaskItemStatus } from '../../../core/models/task.model';

import { TaskService } from '../../../core/services/task';
import { CategoryService } from '../../../core/services/category';

import { PriorityLabelPipe } from '../../../shared/pipes/priority-label.pipe';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-task-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
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
  private readonly destroyRef = inject(DestroyRef);

  readonly task = signal<TaskItem | null>(null);
  readonly categoryName = signal<string | null>(null);
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
        next: (category) => {
          this.categoryName.set(category.name);
        },
        error: () => {
          this.categoryName.set(null);
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
}

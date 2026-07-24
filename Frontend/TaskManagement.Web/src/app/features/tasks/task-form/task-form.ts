import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Category } from '../../../core/models/category.model';

import {
  CreateTaskRequest,
  Priority,
  TaskItemStatus,
  UpdateTaskRequest,
} from '../../../core/models/task.model';

import { CategoryService } from '../../../core/services/category';
import { TaskService } from '../../../core/services/task';

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly Priority = Priority;
  readonly TaskItemStatus = TaskItemStatus;

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly categories = signal<Category[]>([]);

  private taskId: string | null = null;

  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: [Priority.Medium, Validators.required],
    status: [TaskItemStatus.Pending, Validators.required],
    dueDate: [''],
    categoryId: [''],
  });

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(this.taskId !== null);

    this.loadCategories();

    if (this.taskId) {
      this.loadTask(this.taskId);
    }
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.categories.set([]);
      },
    });
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
          this.form.patchValue({
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            status: task.status,
            dueDate: this.toDateTimeLocal(task.dueDate),
            categoryId: task.categoryId ?? '',
          });
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ?? 'Görev bilgileri yüklenirken bir hata oluştu.',
          );
        },
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode() && this.taskId) {
      this.updateTask(this.taskId);
      return;
    }

    this.createTask();
  }

  private createTask(): void {
    const formValue = this.form.getRawValue();

    const request: CreateTaskRequest = {
      title: formValue.title?.trim() ?? '',
      description: formValue.description?.trim() || null,
      priority: formValue.priority ?? Priority.Medium,
      dueDate: this.toIsoDate(formValue.dueDate),
      categoryId: formValue.categoryId || null,
    };

    this.taskService
      .create(request)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Görev başarıyla oluşturuldu.', 'Tamam', {
            duration: 3000,
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? 'Görev oluşturulurken bir hata oluştu.');
        },
      });
  }

  private updateTask(taskId: string): void {
    const formValue = this.form.getRawValue();

    const request: UpdateTaskRequest = {
      title: formValue.title?.trim() ?? '',
      description: formValue.description?.trim() || null,
      priority: formValue.priority ?? Priority.Medium,
      status: formValue.status ?? TaskItemStatus.Pending,
      dueDate: this.toIsoDate(formValue.dueDate),
      categoryId: formValue.categoryId || null,
    };

    this.taskService
      .update(taskId, request)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Görev güncellendi.', 'Tamam', {
            duration: 3000,
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? 'Görev güncellenirken bir hata oluştu.');
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  private toIsoDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return new Date(value).toISOString();
  }

  private toDateTimeLocal(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    const timezoneOffset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }
}

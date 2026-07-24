import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Priority, TaskItem, TaskItemStatus, TaskSortField } from '../../../core/models/task.model';

import { Category } from '../../../core/models/category.model';

import { TaskService } from '../../../core/services/task';
import { CategoryService } from '../../../core/services/category';

import { TaskCard } from '../task-card/task-card';

import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-task-list',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    TaskCard,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly tasks = signal<TaskItem[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  readonly pageSizeOptions = [5, 10, 15, 20];

  readonly searchTerm = signal('');

  readonly Priority = Priority;
  readonly TaskItemStatus = TaskItemStatus;
  readonly TaskSortField = TaskSortField;

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly filterForm = new FormGroup({
    priority: new FormControl<Priority | null>(null),
    status: new FormControl<TaskItemStatus | null>(null),
    categoryId: new FormControl<string | null>(null),
    dueDate: new FormControl<string | null>(null),

    sortBy: new FormControl<TaskSortField>(TaskSortField.CreatedAt, {
      nonNullable: true,
    }),

    descending: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.initializeSearch();
    this.initializeFilters();
    this.loadCategories();
    this.loadTasks();
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchTerm.set(value.trim());
        this.pageNumber.set(1);
        this.loadTasks();
      });
  }

  private initializeFilters(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((filters) => {
        const dueDate = filters.dueDate;

        if (dueDate && !this.isValidDate(dueDate)) {
          return;
        }

        this.pageNumber.set(1);
        this.loadTasks();
      });
  }

  private loadCategories(): void {
    this.categoryService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: () => {
          this.categories.set([]);
        },
      });
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters = this.filterForm.getRawValue();

    this.taskService
      .getAll({
        searchTerm: this.searchTerm() || undefined,
        priority: filters.priority ?? undefined,
        status: filters.status ?? undefined,
        categoryId: filters.categoryId ?? undefined,
        dueDate: this.isValidDate(filters.dueDate)
          ? new Date(filters.dueDate!).toISOString()
          : undefined,

        sortBy: filters.sortBy,
        descending: filters.descending,

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

  onPageChange(event: PageEvent): void {
    const newPageNumber = event.pageIndex + 1;
    const pageSizeChanged = event.pageSize !== this.pageSize();

    this.pageSize.set(event.pageSize);
    this.pageNumber.set(pageSizeChanged ? 1 : newPageNumber);

    this.loadTasks();
  }

  private isValidDate(value: string | null): boolean {
    if (!value) {
      return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  clearFilters(): void {
    this.searchControl.setValue('', {
      emitEvent: false,
    });

    this.searchTerm.set('');

    this.filterForm.reset(
      {
        priority: null,
        status: null,
        categoryId: null,
        dueDate: null,
        sortBy: TaskSortField.CreatedAt,
        descending: true,
      },
      {
        emitEvent: false,
      },
    );

    this.pageNumber.set(1);
    this.loadTasks();
  }

  hasActiveFilters(): boolean {
    const filters = this.filterForm.getRawValue();

    return (
      this.searchTerm() !== '' ||
      filters.priority !== null ||
      filters.status !== null ||
      filters.categoryId !== null ||
      filters.dueDate !== null
    );
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

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
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
          this.snackBar.open('Görev silindi.', 'Tamam', {
            duration: 3000,
          });
          const isLastItemOnPage = this.tasks().length === 1;
          const isNotFirstPage = this.pageNumber() > 1;
          if (isLastItemOnPage && isNotFirstPage) {
            this.pageNumber.update((currentPage) => currentPage - 1);
          }
          this.loadTasks();
        },
      });
  }
}

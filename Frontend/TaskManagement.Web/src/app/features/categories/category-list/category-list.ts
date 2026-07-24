import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-category-list',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly editingId = signal<string | null>(null);
  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    color: [''],
  });
  ngOnInit(): void {
    this.loadCategories();
  }
  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.categoryService
      .getAll()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: (error) => this.errorMessage.set(error.message),
      });
  }

  startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.form.patchValue({
      name: category.name,
      description: category.description ?? '',
      color: category.color,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
    this.errorMessage.set(null);
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.editingId()) {
      this.updateCategory(this.editingId()!);
    } else {
      this.createCategory();
    }
  }
  private createCategory(): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    const formValue = this.form.getRawValue();
    this.categoryService
      .create({
        name: formValue.name!.trim(),
        description: formValue.description?.trim() || null,
        color: formValue.color || undefined,
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.loadCategories();
        },
        error: (error) => this.errorMessage.set(error.message),
      });
  }
  private updateCategory(id: string): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    const formValue = this.form.getRawValue();
    this.categoryService
      .update(id, {
        name: formValue.name!.trim(),
        description: formValue.description?.trim() || null,
        color: formValue.color || undefined,
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.loadCategories();
        },
        error: (error) => this.errorMessage.set(error.message),
      });
  }
  deleteCategory(id: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Kategoriyi Sil',
      message:
        'Bu kategoriyi kalıcı olarak silmek istediğinize emin misiniz? Bu kategoriye ait görevler etkilenmez.',
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
        if (!confirmed) return;
        this.performDelete(id);
      });
  }
  private performDelete(id: string): void {
    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.categoryService
      .delete(id)
      .pipe(
        finalize(() => this.isDeleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.loadCategories(),
        error: (error) => this.errorMessage.set(error.message),
      });
  }
}

import { Component, input, output } from '@angular/core';

import { DatePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Priority, TaskItem, TaskItemStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  readonly task = input.required<TaskItem>();

  readonly detailsClicked = output<string>();
  readonly editClicked = output<string>();
  readonly deleteClicked = output<string>();

  readonly Priority = Priority;
  readonly TaskItemStatus = TaskItemStatus;

  getPriorityLabel(priority: Priority): string {
    const labels: Record<Priority, string> = {
      [Priority.Lowest]: 'Çok Düşük',
      [Priority.Low]: 'Düşük',
      [Priority.Medium]: 'Orta',
      [Priority.High]: 'Yüksek',
      [Priority.Highest]: 'Çok Yüksek',
    };

    return labels[priority];
  }

  getStatusLabel(status: TaskItemStatus): string {
    const labels: Record<TaskItemStatus, string> = {
      [TaskItemStatus.Pending]: 'Bekliyor',
      [TaskItemStatus.InProgress]: 'Devam Ediyor',
      [TaskItemStatus.Completed]: 'Tamamlandı',
      [TaskItemStatus.Cancelled]: 'İptal Edildi',
    };

    return labels[status];
  }

  showDetails(): void {
    this.detailsClicked.emit(this.task().id);
  }

  editTask(): void {
    this.editClicked.emit(this.task().id);
  }

  deleteTask(): void {
    this.deleteClicked.emit(this.task().id);
  }
}

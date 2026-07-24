import { Component, input, output } from '@angular/core';

import { DatePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Priority, TaskItem, TaskItemStatus } from '../../../core/models/task.model';
import { PriorityLabelPipe } from '../../../shared/pipes/priority-label.pipe';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-task-card',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    PriorityLabelPipe,
    StatusLabelPipe,
  ],
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

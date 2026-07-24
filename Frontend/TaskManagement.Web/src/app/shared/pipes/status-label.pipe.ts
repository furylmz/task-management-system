import { Pipe, PipeTransform } from '@angular/core';
import { TaskItemStatus } from '../../core/models/task.model';

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: TaskItemStatus): string {
    const labels: Record<TaskItemStatus, string> = {
      [TaskItemStatus.Pending]: 'Bekliyor',
      [TaskItemStatus.InProgress]: 'Devam Ediyor',
      [TaskItemStatus.Completed]: 'Tamamlandı',
      [TaskItemStatus.Cancelled]: 'İptal Edildi',
    };

    return labels[status] ?? 'Bilinmiyor';
  }
}

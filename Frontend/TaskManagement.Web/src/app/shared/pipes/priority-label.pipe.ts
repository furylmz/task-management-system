import { Pipe, PipeTransform } from '@angular/core';
import { Priority } from '../../core/models/task.model';

@Pipe({
  name: 'priorityLabel',
  standalone: true,
})
export class PriorityLabelPipe implements PipeTransform {
  transform(priority: Priority): string {
    const labels: Record<Priority, string> = {
      [Priority.Lowest]: 'Çok Düşük',
      [Priority.Low]: 'Düşük',
      [Priority.Medium]: 'Orta',
      [Priority.High]: 'Yüksek',
      [Priority.Highest]: 'Çok Yüksek',
    };

    return labels[priority] ?? 'Bilinmiyor';
  }
}

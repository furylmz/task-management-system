import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  CreateTaskRequest,
  TaskItem,
  TaskQueryParams,
  TaskStatistics,
  UpdateTaskRequest
} from '../models/task.model';

import { PagedResult } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Tasks`;

  getAll(query?: TaskQueryParams): Observable<PagedResult<TaskItem>> {

    let params = new HttpParams();

    if (query) {

      if (query.searchTerm) {
        params = params.set('SearchTerm', query.searchTerm);
      }

      if (query.priority !== undefined) {
        params = params.set('Priority', query.priority);
      }

      if (query.status !== undefined) {
        params = params.set('Status', query.status);
      }

      if (query.categoryId) {
        params = params.set('CategoryId', query.categoryId);
      }

      if (query.dueDate) {
        params = params.set('DueDate', query.dueDate);
      }

      if (query.pageNumber) {
        params = params.set('PageNumber', query.pageNumber);
      }

      if (query.pageSize) {
        params = params.set('PageSize', query.pageSize);
      }

    }

    return this.http.get<PagedResult<TaskItem>>(this.apiUrl, {
      params
    });

  }

  getById(id: string): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateTaskRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, request);
  }

  update(id: string, request: UpdateTaskRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOverdue(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(`${this.apiUrl}/overdue`);
  }

  getStatistics(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(`${this.apiUrl}/statistics`);
  }

}
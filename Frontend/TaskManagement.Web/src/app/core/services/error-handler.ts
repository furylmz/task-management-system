import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiErrorResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handle(error: HttpErrorResponse): ApiErrorResponse {
    if (error.status === 0) {
      return {
        status: 0,
        message:
          'The server could not be reached. Check that the backend application is running.'
      };
    }

    return {
      status: error.status,
      message: this.getMessage(error),
      validationErrors: this.getValidationErrors(error)
    };
  }

  private getMessage(error: HttpErrorResponse): string {
    const backendMessage = this.readStringProperty(error.error, 'message');

    if (backendMessage) {
      return backendMessage;
    }

    const problemDetailsTitle = this.readStringProperty(error.error, 'title');

    if (problemDetailsTitle) {
      return problemDetailsTitle;
    }

    switch (error.status) {
      case 400:
        return 'The submitted information is invalid.';

      case 401:
        return 'You need to log in for this operation.';

      case 403:
        return 'You do not have the authority to perform this operation.';

      case 404:
        return 'The requested resource was not found.';

      case 409:
        return 'The submitted information conflicts with an existing record.';

      case 500:
        return 'An unexpected error occurred on the server.';

      default:
        return 'An unexpected error occurred during the operation.';
    }
  }

  private getValidationErrors(
    error: HttpErrorResponse
  ): Record<string, string[]> | undefined {
    if (!this.isObject(error.error)) {
      return undefined;
    }

    const errors = error.error['errors'];

    if (!this.isObject(errors)) {
      return undefined;
    }

    const validationErrors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(errors)) {
      if (
        Array.isArray(value) &&
        value.every(item => typeof item === 'string')
      ) {
        validationErrors[key] = value;
      }
    }

    return Object.keys(validationErrors).length > 0
      ? validationErrors
      : undefined;
  }

  private readStringProperty(
    value: unknown,
    propertyName: string
  ): string | undefined {
    if (!this.isObject(value)) {
      return undefined;
    }

    const property = value[propertyName];

    return typeof property === 'string'
      ? property
      : undefined;
  }

  private isObject(
    value: unknown
  ): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
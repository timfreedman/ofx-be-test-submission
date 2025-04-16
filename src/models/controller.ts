import type { ApiResponseSuccess, ApiResponseError } from './apiResponse';

export interface ControllerResult {
  result: ApiResponseSuccess | ApiResponseError,
  statusCode: number;
}

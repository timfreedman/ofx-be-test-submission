import { ApiResponseError, ApiResponseSuccess } from "../models/apiResponse";

export const apiSuccessResponse = (data: object): ApiResponseSuccess => {
  return {
    data
  };
}

export const apiErrorResponse = (error: string): ApiResponseError => {
  return {
    error
  };
}

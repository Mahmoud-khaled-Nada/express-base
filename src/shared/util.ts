import { ApiResponse } from "./types";

export const createApiResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  errors?: string[]
): ApiResponse<T> => ({
  success,
  message,
  data,
  errors,
  timestamp: new Date(),
});

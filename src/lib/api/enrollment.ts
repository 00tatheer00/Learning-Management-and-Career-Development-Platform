export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createApiResponse<T>(
  success: boolean,
  options: { data?: T; error?: string; message?: string } = {}
): ApiResponse<T> {
  return { success, ...options };
}

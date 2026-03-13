export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
}

export class ApiError extends Error {
  error: string;
  statusCode?: number;

  constructor(payload: ApiErrorResponse) {
    super(payload.message);
    this.name = "ApiError";
    this.error = payload.error;
    this.statusCode = payload.statusCode;
  }
}

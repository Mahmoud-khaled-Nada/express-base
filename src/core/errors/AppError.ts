export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = "ERR_GENERIC", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(msg: string, details?: unknown) {
    return new AppError(400, msg, "ERR_BAD_REQUEST", details);
  }
  static unauthorized(msg = "Unauthorized") {
    return new AppError(401, msg, "ERR_UNAUTHORIZED");
  }
  static notFound(msg = "Not Found") {
    return new AppError(404, msg, "ERR_NOT_FOUND");
  }
  static conflict(msg: string) {
    return new AppError(409, msg, "ERR_CONFLICT");
  }
  static internal(msg = "Internal Server Error", details?: unknown) {
    return new AppError(500, msg, "ERR_INTERNAL", details);
  }
}

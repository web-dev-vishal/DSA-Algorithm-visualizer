export class ApiResponse {
  constructor(statusCode, data = null, message = 'Request Successful', meta = {}, errors = []) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.errors = errors;
  }

  static success(res, data = null, message = 'Request Successful', statusCode = 200, meta = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
      errors: []
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      meta: {},
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }
}

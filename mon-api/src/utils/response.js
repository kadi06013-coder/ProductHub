/**
 * Standard API response helpers
 */
const success = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Resource created') =>
  success(res, data, message, 201);

const notFound = (res, message = 'Resource not found') =>
  res.status(404).json({ success: false, message });

const serverError = (res, message = 'Internal server error') =>
  res.status(500).json({ success: false, message });

module.exports = { success, created, notFound, serverError };

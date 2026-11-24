/**
 * Standard API response helpers
 */
const success = (res, data, message = 'Success', statusCode = 200, meta) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const created = (res, data, message = 'Resource created') =>
  success(res, data, message, 201);

const notFound = (res, message = 'Resource not found') =>
  res.status(404).json({ success: false, message });

module.exports = { success, created, notFound };

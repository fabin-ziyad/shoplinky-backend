exports.handleApiError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

exports.handleApiSuccess = (res, statusCode, message, data) => {
  return res.status(statusCode).json({ success: true, message, data });
};

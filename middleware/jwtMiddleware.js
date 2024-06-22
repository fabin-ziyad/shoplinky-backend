const jwt = require("./auth");

const noAuthRequired = [
  /^\/auth\/.*/,
  /^\/check-store-name$/,
  /^\/createUser$/,
  /^\/status$/,
  /^\/store\/.*/,
];

function conditionalAuthMiddleware(req, res, next) {
  console.log("Request path:", req.path);

  const isNoAuthPath = noAuthRequired.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(req.path);
    }
    return req.path === pattern;
  });

  console.log("Is no auth required:", isNoAuthPath);

  if (isNoAuthPath) {
    return next();
  }

  return jwt.verify(req, res, next);
}

module.exports = conditionalAuthMiddleware;

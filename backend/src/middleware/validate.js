// Validates params/query/body with zod. Results land on req.valid (Express 5 makes req.query read-only).
module.exports = (schemas) => (req, _res, next) => {
  try {
    req.valid = {};
    for (const part of ['params', 'query', 'body']) {
      if (schemas[part]) req.valid[part] = schemas[part].parse(req[part]);
    }
    next();
  } catch (err) {
    next(err);
  }
};

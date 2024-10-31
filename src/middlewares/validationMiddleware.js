export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const errorDetails = err.errors[0].message;
    res.status(400).json({ message: "Invalid data", errors: errorDetails });
  }
};

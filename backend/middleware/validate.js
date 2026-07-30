import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array();
    // Include a human-readable `message` (the first validation failure) in
    // addition to the full `errors` array. Clients read `data.message` to show
    // the reason a request was rejected; without it every validation failure
    // surfaces only a generic fallback like "Unable to create your account."
    return res.status(400).json({ success: false, message: list[0]?.msg || "Validation failed", errors: list });
  }
  next();
};

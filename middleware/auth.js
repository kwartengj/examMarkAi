// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res
    .status(401)
    .json({ success: false, message: "Unauthorized: Please log in" });
};

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action",
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is an admin
export const isOwnerOrAdmin = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    // Check if user is admin or the owner of the resource
    if (
      req.user.role === "admin" ||
      resource.createdBy.toString() === req.user._id.toString()
    ) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: "Forbidden: You do not have permission to perform this action",
    });
  } catch (error) {
    next(error);
  }
};

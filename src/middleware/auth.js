const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/auth.config");
const GroupModel = require("../models/group");

const isAdmin = (req, res, next) => {
  const token = req.headers.authorization; // Assuming token is sent in the Authorization header
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if the user is an admin based on the decoded toke
    if (decoded && decoded.is_admin == 1) {
      req.user = decoded; // Attaching user details to the request object if needed
      return next(); // User is admin, proceed to the next middleware/controller
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user details to the request object if needed
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const isGroupOwnerOrAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId; // Assuming userId is stored in the token payload
    // Your logic to determine if the user is the creator or an admin
    const groupId = req.params.groupId;
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.created_by !== userId && !decoded.is_admin) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Not the group owner or admin" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Maintain a list of revoked tokens
const revokedTokens = new Set();
const isTokenRevoked = (req, res, next) => {
  const token = req.headers.authorization;

  if (revokedTokens.has(token)) {
    return res
      .status(401)
      .json({ message: "Token revoked. Please login again" });
  } else {
    return next();
  }
};
const addToRevokedTokens = (token) => {
  revokedTokens.add(token);
};
const removeFromRevokedTokens = (token) => {
  revokedTokens.delete(token);
};

module.exports = {
  isAdmin,
  isAuthenticated,
  isGroupOwnerOrAdmin,
  isTokenRevoked,
  addToRevokedTokens,
  removeFromRevokedTokens,
};

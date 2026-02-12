const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Let CORS preflight requests pass through
  if (req.method === "OPTIONS") return next();

  // Let load balancer health checks pass through (if you use /health)
  if (req.path === "/health") return next();

  const authHeader = req.headers.authorization; // "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ err: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded.payload; // matches how you sign it
    return next();
  } catch (error) {
    return res.status(401).json({ err: error.message });
  }
}

module.exports = verifyToken;
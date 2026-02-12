const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

  if (req.method === "OPTIONS") return next();


  if (req.path === "/health") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ err: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded.payload;
    return next();
  } catch (error) {
    return res.status(401).json({ err: error.message });
  }
}

module.exports = verifyToken;
import jwt from "jsonwebtoken";
import "dotenv/config";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token or malformed token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // optional - for future use
    next();
  } catch (error) {
    console.log("Error occurred while authenticating:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default auth;
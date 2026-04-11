import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  try {
    const { adminToken } = req.cookies;

    if (!adminToken) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized: no token" });
    }

    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

    req.admin = decoded; 
    next();

  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authAdmin;



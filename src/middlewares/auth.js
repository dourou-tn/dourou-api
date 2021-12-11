const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_TOKEN_KEY;

module.exports = function (req, res, next) {
  let token = req.header("Authorization")
  if (!token) return res.status(401).json({ message: "Auth Error" })
  token = token.split("Bearer ")[1]
  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded.user
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" })
  }
}
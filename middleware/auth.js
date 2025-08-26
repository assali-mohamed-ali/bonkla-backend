const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  const secret = process.env.JWT_SECRET || "secretkey";

  if (!token) return res.status(401).json({ message: 'Accès refusé' });

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Token invalide' });
  }
};

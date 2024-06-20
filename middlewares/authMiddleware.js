const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig'); // Certifique-se de que o caminho para jwtConfig está correto

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

  if (!token) {
    return res.status(403).json({ message: "Acesso negado. Nenhum token fornecido." });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ message: "Token inválido." });
  }
}

module.exports = authMiddleware;

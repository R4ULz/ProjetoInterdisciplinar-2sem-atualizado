const checkRole = (roles) => (req, res, next) => {
    if (req.isAuthenticated() && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).send('Acesso Negado');
    }
  };
  
module.exports = checkRole;
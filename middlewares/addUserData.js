const User = require('../models/User');

module.exports = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findByPk(req.user.UserId);
      if (user) {
        res.locals.dadosUser = {
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          endereco: user.endereco,
          telefone: user.telefone,
          foto: user.foto
        };
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }
  next();
};

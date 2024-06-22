// const checkRole = (roles) => (req, res, next) => {
//     if (req.isAuthenticated() && roles.includes(req.user.role)) {
//       next();
//     } else {
//       req.flash('error_msg', 'Você não tem permissão para acessar essa página');
//       res.redirect('/');
//     }
//   };
  
// module.exports = checkRole;
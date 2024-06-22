const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User  = require("../models/User");

const authMiddleware = (req, res, next) => {
  res.locals.userLoggedIn = req.isAuthenticated();
  res.locals.isAdmin = req.user && req.user.isAdmin;
  res.locals.isManager = req.user && req.user.isManager;

  next();
};


passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const foundUser = await User.findOne({ where: { email } });
        if (!foundUser) {
          return done(null, false, { message: "Usuário não encontrado" });
        }

        const isValidPassword = await bcrypt.compare(
          password,
          foundUser.password
        );
        if (!isValidPassword) {
          return done(null, false, { message: "Senha incorreta" });
        }

        return done(null, foundUser); // O usuário é autenticado aqui
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    if (user) {
      
      user.isAdmin = user.role === 'admin';
      user.isManager = user.role === 'manager';
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = {passport, authMiddleware};

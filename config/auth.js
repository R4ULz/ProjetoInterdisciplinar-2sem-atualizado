const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const {User} = require('../models/models')

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const foundUser = await User.findOne({ where: { email } });
      if (!foundUser) {
        console.log("usuario n encontrado")
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      if (!foundUser.password) {
        console.log("Senha ou senha do usuário não definida");
        return done(null, false, { message: 'Senha ou senha do usuário não definida' });
      }

      const isValidPassword = await bcrypt.compare(password, foundUser.password);
      if (!isValidPassword) {
        console.log('senha ruim')
        return done(null, false, { message: 'Senha incorreta' });
      }
      return done(null, foundUser);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  module.exports = passport;


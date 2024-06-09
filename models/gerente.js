const db = require("./banco");

const Gerente = db.sequelize.define("Gerente",{
  gerenteId: {
    type: db.Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  turno:{
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  email:{
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  senha:{
    type: db.Sequelize.STRING,
    allowNull: false,
  }
})

module.exports = Gerente;
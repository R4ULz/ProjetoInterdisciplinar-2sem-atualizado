const db = require("./banco")
const bcrypt = require('bcryptjs');

const User = db.sequelize.define("User", {
    UserId: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    foto: {
        type: db.Sequelize.STRING,
        allowNull: true,
      },
    nome: {
      type: db.Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: db.Sequelize.STRING,
      allowNull: false,
    },
    endereco: { 
      type: db.Sequelize.STRING,
      allowNull: true, 
    },
    telefone: { 
      type: db.Sequelize.STRING,
      allowNull: true, 
    },
    cpf: {
      type: db.Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: db.Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: db.Sequelize.STRING,
      defaultValue: 'user', // O padrão pode ser 'user', 'admin', 'manager', etc.
      allowNull: false,
    }
  });

  User.afterSync(async () => {
    // Verifica se já existe um administrador
    const admin = await User.findOne({ where: { email: "admin@example.com" } });
    if (!admin) {
      const hashPassword = await bcrypt.hash("admkrusty01", 8);  // Substitua "admin123" por uma senha segura
      await User.create({
        nome: "Admin",
        email: "admkrusty@krusty.com",
        cpf: "00000000000",  // Substitua por um CPF válido ou outro identificador
        password: hashPassword,
        role: "admin",
      });
      console.log("Administrador criado com sucesso!");
    }
  });

module.exports = User

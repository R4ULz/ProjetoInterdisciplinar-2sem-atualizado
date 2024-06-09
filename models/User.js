const db = require("./banco")
const Pedido = require('./pedido');

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
  });

//Adicionando login de adms automaticamente ao ser iniciada
// User.addHook('afterSync', 'addInitialData', async () => {
//     try {
//         await User.bulkCreate([
//             { nome: 'adm1', email: 'admkrusty@krusty.com.br', cpf: '12345678900', password: 'admkrusty01' }
//         ]);
//         console.log('Valores iniciais adicionados com sucesso!');
//     } catch (error) {
//         console.error('Erro ao adicionar valores iniciais:', error);
//     }
// });


module.exports = User

const db = require("./banco");
const Pedido = require('./pedido');  // Verifique se o caminho para o arquivo está correto.

const Pedido_Produto = db.sequelize.define('Pedido_Produto', {
    Quantidade: {
      type: db.Sequelize.INTEGER,
      allowNull: false
    },
    PrecoUnitario: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
});

module.exports = Pedido_Produto;
const db = require("./banco")
const User = require('./User');
const Pedido_Produto = require('./pedido_produto');
const Produto = require('./produto');

const Pedido = db.sequelize.define('Pedido', {
    PedidoId: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Total: {
      type: db.Sequelize.DECIMAL(10, 2),  // Tipo decimal para suportar centavos
      allowNull: false,
      defaultValue: 0.00  // Inicializa com zero
    },
    Status: {
      type: db.Sequelize.ENUM('Ativo', 'concluído', 'cancelado'),
      allowNull: false
    }
  });

  Pedido.associate = function(models) {
    Pedido.hasMany(models.Pedido_Produto, { foreignKey: 'PedidoId' });
  };

module.exports = Pedido;
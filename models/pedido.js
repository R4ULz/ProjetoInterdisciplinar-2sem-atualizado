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
    DataPedido: {
      type: db.Sequelize.DATE,
      allowNull: true
    },
    Status: {
      type: db.Sequelize.ENUM('Ativo', 'concluído', 'cancelado'),
      allowNull: false
    }
  });


// Pedido.belongsTo(User, {
//     constraint: true,
//     foreignKey: 'UserId'
// })

// Pedido.belongsToMany(Produto, { through: Pedido_Produto, foreignKey: 'PedidoID', otherKey: 'ProdutoID' });


module.exports = Pedido;
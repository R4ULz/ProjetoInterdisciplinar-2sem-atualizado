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
      allowNull: false
    },
    Status: {
      type: db.Sequelize.ENUM('Ativo', 'concluído', 'cancelado'),
      allowNull: false
    }
  });

  if(Pedido.prototype instanceof db.Sequelize.Model) {
    console.log("Pedido is a Sequelize model.");
}else {
    console.error("Pedido is NOT a Sequelize model.");
}
try {
    Produto.belongsToMany(Pedido, { through: Pedido_Produto, foreignKey: 'ProdutoId', otherKey: 'PedidoId' });
} catch (error) {
    console.error("Failed to define relationship:", error);
}

// Pedido.belongsTo(User, {
//     constraint: true,
//     foreignKey: 'UserId'
// })

// Pedido.belongsToMany(Produto, { through: Pedido_Produto, foreignKey: 'PedidoID', otherKey: 'ProdutoID' });


module.exports = Pedido;
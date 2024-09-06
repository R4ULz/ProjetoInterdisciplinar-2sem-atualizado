const db = require("./banco");

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

Pedido_Produto.associate = function(models) {
    Pedido_Produto.belongsTo(models.pedido, { foreignKey: 'PedidoId' });
  };
module.exports = Pedido_Produto;

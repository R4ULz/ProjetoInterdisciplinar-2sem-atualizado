const db = require("./banco");
const Pedido_Produto = require('./pedido_produto');
const Produto = require('./produto');

const Pedido = db.sequelize.define('pedido', {
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
        type: db.Sequelize.ENUM('Aguardando Pagamento', 'Preparando', 'Concluído', 'Saiu para entrega', 'Pronto para retirar', 'Cancelado'),
        allowNull: false
    }
})

Pedido.associate = function(models) {
    Pedido.hasMany(models.Pedido_Produto, { foreignKey: 'pedidoId' });
  };


module.exports = Pedido;

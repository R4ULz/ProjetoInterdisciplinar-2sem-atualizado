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
}, {
    tableName: 'pedido_produto',  // Nome da tabela em minúsculas para PostgreSQL
    timestamps: false  // Desativa timestamps se não for necessário
});

// Definição das associações
Pedido_Produto.associate = function(models) {
    Pedido_Produto.belongsTo(models.Pedido, { foreignKey: 'PedidoId', as: 'pedido' });
    Pedido_Produto.belongsTo(models.Produto, { foreignKey: 'ProdutoId', as: 'produto' });
};

db.sequelize.models.Pedido_Produto.associate(db.sequelize.models);

module.exports = Pedido_Produto;

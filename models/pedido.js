const db = require("./banco");

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
        type: db.Sequelize.ENUM('Aguardando Pagamento', 'Preparando', 'Concluído', 'Saiu para entrega', 'Pronto para retirar', 'Cancelado'),
        allowNull: false
    }
}, {
    tableName: 'pedidos',  // Nome da tabela em minúsculas para PostgreSQL
    timestamps: false  // Desativa timestamps se não for necessário
});

// Definição das associações
//Pedido.associate = function(models) {
//    Pedido.hasMany(models.Pedido_Produto{ foreignKey: 'PedidoId' });
//Pedido.belongsTo(models.User{ foreignKey: 'UserId' });  // Associações adicionais, se necessário
    // Se Pedido_Produto também tem associações, defina aqui
//};

//db.sequelize.models.Pedido.associate(db.sequelize.models);

module.exports = Pedido;

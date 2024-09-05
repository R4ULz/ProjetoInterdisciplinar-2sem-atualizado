const db = require("./banco");
const Pedido = require('./pedido');
const Pedido_Produto = require('./pedido_produto');

const Produtos = db.sequelize.define("Produtos", {
    ProdutoId: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    imagem: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    nome: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2), // DECIMAL é mais apropriado para valores monetários
        allowNull: false
    },
    descricao: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    categoria: {
        type: db.Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'produtos', // Nome da tabela em minúsculas
    timestamps: false // Desativa timestamps se você não estiver usando createdAt e updatedAt
});

module.exports = Produtos;

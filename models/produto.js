const db = require("./banco")
const Pedido = require('./pedido');
const Pedido_Produto = require('./pedido_produto');



const Produtos = db.sequelize.define("produtos",{
    ProdutoId:{
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    imagem:{
        type: db.Sequelize.STRING,
        allowNull:false
    },
    nome:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
    valor:{
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },
    descricao:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
    categoria:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
})


module.exports = Produtos
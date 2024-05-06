const db = require("./banco")

const Produtos = db.sequelize.define("produtos",{
    id:{
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

//Produtos.sync({force: true})

module.exports = Produtos
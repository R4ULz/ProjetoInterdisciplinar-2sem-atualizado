const {Sequelize} = require("sequelize")

const sequelize = new Sequelize("krusty_burger", "root", "", {
    host:"localhost",
    dialect: "postgres",
    logging: "false"
})

sequelize.authenticate().then(() =>{
    console.log("Banco de dados conectado com sucesso")
}).catch((erro) => {
    console.log("falha ao conectar" + erro)
})

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
}

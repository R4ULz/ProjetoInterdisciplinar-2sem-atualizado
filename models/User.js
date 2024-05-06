// const {Sequelize, DataTypes} = require("sequelize");
const db = require("./banco")


const User = db.sequelize.define("User",{
    id:{
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome:{
        type: db.Sequelize.STRING,
        allowNull:false
    },
    email:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
    cpf:{
        type: db.Sequelize.STRING,
        allowNull: false
    },
    password:{
        type: db.Sequelize.STRING,
        allowNull: false
    }
})

//User.sync({force: true})

module.exports = User

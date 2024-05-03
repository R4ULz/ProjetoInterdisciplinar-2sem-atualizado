const {Sequelize, DataTypes} = require("sequelize");
//const db = require("./banco")

const sequelize = new Sequelize("krusty_burger", "root", "", {
    host:"localhost",
    dialect: "mysql"
})

const User = sequelize.define("User",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome:{
        type: DataTypes.STRING,
        allowNull:false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    }
})

//User.sync({force: true})

module.exports = {User, sequelize};

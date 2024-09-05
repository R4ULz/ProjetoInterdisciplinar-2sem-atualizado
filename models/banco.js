const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
});

sequelize.authenticate().then(() => {
    console.log('Banco de dados conectado com sucesso');
}).catch((erro) => {
    console.log('Falha ao conectar: ' + erro);
});

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
};

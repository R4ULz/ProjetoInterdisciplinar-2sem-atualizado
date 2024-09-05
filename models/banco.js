const { Sequelize } = require('sequelize');

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 5432; // Porta padrão do PostgreSQL
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false // Desative o logging SQL se não for necessário
});

// Verifique a conexão
sequelize.authenticate().then(() => {
    console.log('Banco de dados conectado com sucesso');
}).catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
});

module.exports = {
    Sequelize,
    sequelize
};

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
// Adicionando login de adms automaticamente ao ser iniciada
// User.addHook('afterSync', 'addInitialData', async () => {
//     try {
//         await User.bulkCreate([
//             { nome: 'adm1', email: 'admkrusty@krusty.com.br', cpf: '12345678900', password: 'admkrusty01' }
//         ]);
//         console.log('Valores iniciais adicionados com sucesso!');
//     } catch (error) {
//         console.error('Erro ao adicionar valores iniciais:', error);
//     }
// });

// Sincronizando o modelo com o banco de dados
//User.sync({force: true})

module.exports = User

const db = require('./banco'); // ajuste o caminho conforme necessário

// Importando modelos
const User = require('./User');
const Pedido = require('./pedido');
const Produto = require('./produto');
const Pedido_Produto = require('./pedido_produto');

// Definindo relacionamentos
User.hasMany(Pedido, {
    constraint: true,
    foreignKey: 'UserId'});
Pedido.belongsTo(User, {
    constraint: true,
    foreignKey: 'UserId'});
}
Produto.belongsToMany(Pedido, { 
  through: Pedido_Produto,
  foreignKey: 'ProdutoId',
  otherKey: 'PedidoId'
 });
Pedido.belongsToMany(Produto, { 
    through: Pedido_Produto,
    foreignKey: 'PedidoId',  // Chave estrangeira para Pedido em Pedido_Produto
    otherKey: 'ProdutoId'    // Chave estrangeira para Produto em Pedido_Produto
});


Pedido.hasMany(Pedido_Produto, { foreignKey: 'PedidoId' });
Pedido_Produto.belongsTo(Pedido, {
  foreignKey: 'PedidoId'  // Confirma que a chave estrangeira na tabela 'Pedido_Produto' é 'PedidoId'
});

Produto.hasMany(Pedido_Produto, {
  foreignKey: 'ProdutoId'
});
Pedido_Produto.belongsTo(Produto, {
  foreignKey: 'ProdutoId'
});
module.exports = {
  db,
  User,
  Pedido,
  Produto,
  Pedido_Produto
};

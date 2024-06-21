const db = require('./banco'); // ajuste o caminho conforme necessário

// Importando modelos
const User = require('./User');
const Pedido = require('./pedido');
const Produto = require('./produto');
const Pedido_Produto = require('./pedido_produto');

// Definindo relacionamentos
User.hasMany(Pedido, {
  foreignKey: 'UserId',
  constraints: true
});
Pedido.belongsTo(User, {
  foreignKey: 'UserId',
  constraints: true
});


Produto.belongsToMany(Pedido, { 
  through: Pedido_Produto,
  foreignKey: 'ProdutoId',
  otherKey: 'PedidoId',
  as: 'Pedidos'
})
Pedido.belongsToMany(Produto, { 
  through: Pedido_Produto,
  foreignKey: 'PedidoId',
  otherKey: 'ProdutoId',
  as: 'Produtos'
});


Pedido.hasMany(Pedido_Produto, { foreignKey: 'PedidoId', as: 'pedido_produtos' });
Pedido_Produto.belongsTo(Pedido, { foreignKey: 'PedidoId', as: 'Pedido' });

Produto.hasMany(Pedido_Produto, { foreignKey: 'ProdutoId', as: 'pedido_produtos' });
Pedido_Produto.belongsTo(Produto, { foreignKey: 'ProdutoId', as: 'Produto' });

module.exports = {
  db,
  User,
  Pedido,
  Produto,
  Pedido_Produto,
};

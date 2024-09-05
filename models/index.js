const db = require('./banco'); // Ajuste o caminho conforme necessário

// Importando modelos
const User = require('./User');
const Pedido = require('./pedido');
const Produto = require('./produto');
const Pedido_Produto = require('./pedido_produto');

// Definindo relacionamentos

// Um usuário pode ter muitos pedidos
User.hasMany(Pedido, {
  foreignKey: 'UserId',
  constraints: true,
  as: 'pedidos' // Nome da associação
});

// Um pedido pertence a um usuário
Pedido.belongsTo(User, {
  foreignKey: 'UserId',
  constraints: true,
  as: 'usuario' // Nome da associação
});

// Um produto pode estar em muitos pedidos através de Pedido_Produto
Produto.belongsToMany(Pedido, { 
  through: Pedido_Produto,
  foreignKey: 'ProdutoId',
  otherKey: 'PedidoId',
  as: 'pedidos' // Nome da associação
});

// Um pedido pode ter muitos produtos através de Pedido_Produto
Pedido.belongsToMany(Produto, { 
  through: Pedido_Produto,
  foreignKey: 'PedidoId',
  otherKey: 'ProdutoId',
  as: 'produtos' // Nome da associação
});

// Um pedido pode ter muitos Pedido_Produto
Pedido.hasMany(Pedido_Produto, { 
  foreignKey: 'PedidoId',
  as: 'pedido_produtos' // Nome da associação
});

// Pedido_Produto pertence a um pedido
Pedido_Produto.belongsTo(Pedido, { 
  foreignKey: 'PedidoId',
  as: 'pedido' // Nome da associação
});


Produto.hasMany(Pedido_Produto, { 
  foreignKey: 'ProdutoId',
  as: 'pedido_produtos' // Nome da associação
});


Pedido_Produto.belongsTo(Produto, { 
  foreignKey: 'ProdutoId',
  as: 'produto' // Nome da associação
});

module.exports = {
  db,
  User,
  Pedido,
  Produto,
  Pedido_Produto,
};

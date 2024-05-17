const db = require('./banco'); // ajuste o caminho conforme necessário

// Importando modelos
const User = require('./User');
const Pedido = require('./pedido');
const Produto = require('./produto');
const Pedido_Produto = require('./pedido_produto');

// Definindo relacionamentos
User.hasMany(Pedido, {
    constraint: true,
    foreignKey: 'PedidoId'});
Pedido.belongsTo(User, {
    constraint: true,
    foreignKey: 'UserId'});

Produto.belongsToMany(Pedido, { through: Pedido_Produto });
Pedido.belongsToMany(Produto, { through: Pedido_Produto });

module.exports = {
  db,
  User,
  Pedido,
  Produto,
  Pedido_Produto
};

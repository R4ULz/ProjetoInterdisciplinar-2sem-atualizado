const express = require("express");
const router = express.Router();
const Produto = require("./models/produto");
const Pedido = require('./models/pedido')
const User = require("./models/User");
const db = require("./models/banco");
const Pedido_Produto = require('./models/pedido_produto');
const bcrypt = require("bcryptjs");
const passport = require("./config/auth");
const LocalStrategy = require("passport-local").Strategy;

//require do body-parser para pegar os dados do form

passport.serializeUser((user, done) => {
  console.log("Serializando", user.UserId)
  done(null, user.UserId);
});

passport.deserializeUser((UserId, done) => {
  console.log("Desserializando ID:", UserId)
  User.findById(UserId, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);  // O usuário não foi encontrado
    }
    return done(null, user);
  });
});

//config do bodyparser para leitura do post

// Rota inicial
router.get("/", logUserId, (req, res) => {
  let userLoggedIn = false;
  if (req.isAuthenticated()) {
    userLoggedIn = true;
  }
  Produto
    .findAll()
    .then((produtos) => {
      res.render("index", { Produto: produtos, userLoggedIn});
    })
    .catch((erro) => {
      console.log("erro ao buscar produtos" + erro);
      res.status(500).send("Erro ao buscar usuarios");
    });

    
});

// Rota para cadastrar produto
router.get("/cadastrarProduto", (req, res) => {
  res.render("cadProduto");
});

// Rota POST para cadastrar produto
router.post("/cadastrarProduto", (req, res) => {
  Produto
    .create({
      imagem: req.body.imagem,
      nome: req.body.nome,
      valor: req.body.valor,
      descricao: req.body.descricao,
      categoria: req.body.categoria,
    })
    .then(() => {
      res.redirect("/cadastrarProduto");
    })
    .catch((erro) => {
      console.log("Falha ao cadastrar os dados" + erro);
    });
});

//rota para consultar
router.get("/consultar", (req, res) => {
  Produto
    .findAll()
    .then((produtos) => {
      console.log("cheghei aquii");
      res.render("consultar", { Produto: produtos });
    })
    .catch(function (erro) {
      res.send("Falha ao consultar os dados: " + erro);
    });
});

//rota para editar
router.get("/editar/:id", function (req, res) {
  Produto
    .findAll({ where: { id: req.params.id } })
    .then(function (produtos) {
      res.render("editarProduto", { Produto: produtos });
    })
    .catch(function (erro) {
      res.send("Falha ao acessar a pagina editar: " + erro);
    });
});

//metodo para atualizar da rota editar
router.post("/atualizar", function (req, res) {
  Produto
    .update(
      {
        imagem: req.body.imagem,
        nome: req.body.nome,
        valor: req.body.valor,
        descricao: req.body.descricao,
        categoria: req.body.categoria,
      },
      { where: { id: req.body.id } }
    )
    .then(function () {
      res.redirect("/consultar");
    })
    .catch(function (erro) {
      res.send("Falha ao atualizar os dados: " + erro);
    });
});

// botão pra excluir
router.get("/excluir/:id", function (req, res) {
  Produto
    .destroy({ where: { id: req.params.id } })
    .then(function () {
      res.redirect("/consultar");
    })
    .catch(function (erro) {
      res.send("erro ao excluir" + erro);
    });
});

//rota cadastro
router.get("/signin", (req, res) => {
  res.render("signin");
});


//metodo post do signin
router.post("/signin", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.render("signin", {
        message: "Esse email está em uso!",
        name: req.body.name,
        cpf: req.body.cpf,
        email: req.body.email,
      });
    }

    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
        // Verifica se as senhas são iguais
        if (password !== confirmPassword) {
          return res.render("signin", {
            message: "As senhas não coincidem!",
            name: req.body.name,
            cpf: req.body.cpf,
            email: req.body.email,
          });
        }
    
        if (!password || !confirmPassword) {
          return res.status(400).send("Senha não fornecida");
        }
    


    const hashPassword = await bcrypt.hash(password, 8);

    await User.create({
      nome: req.body.name,
      email: req.body.email,
      cpf: req.body.cpf,
      password: hashPassword,
    });

    console.log("Usuário cadastrado com sucesso no banco de dados!");
    res.redirect(
      "/login?success=Usuário cadastrado com sucesso! Faça o login agora."
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).send("Erro ao criar usuário");
  }
});

//rota login ADM
router.get("/loginAdm", (req, res)=>{
  res.render("loginAdm")
})
//rota painel ADM
router.get("/painelAdm", (req, res)=>{
  res.render("painelAdm")
})

//rota login
router.get("/login", (req, res) => {
  res.render("login");
});

//método post do login
router.post("/login",
  async (req, res, next) => {
    const email = req.body.email; // Obtenha o email do corpo da solicitação
    const password = req.body.password; // Obtenha a senha do corpo da solicitação
    if (email === "admkrusty@krusty.com.br" && password === "admkrusty01") {
      return res.redirect("/painelAdm");
    } else {
      next();
    }
  },
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true,
  }),
  
);

// Rota para renderizar a página de perfil
router.get("/profile", (req, res) => {
  
  if (req.isAuthenticated()) {
    const  userlogado  = req.user;
    const {nome, email, cpf} = userlogado
    const dadosUser = {nome,email,cpf}
    const userLoggedIn = true;
    res.render("user_info",  {dadosUser ,userLoggedIn});
  } else {
    // Se o usuário não estiver autenticado, redirecione-o para a página de login
    res.redirect("/login");
  }
});

router.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json({});
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.redirect("/login");
    });
  });
});



router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/s", verificaAutenticacao, (req, res) => {
  res.render("alterar-senha");
});

router.post("/alterar-senha", async (req, res) => {
  try {
    const novaSenha = req.body.novaSenha;
    const usuarioId = req.session.user;

    // Criptografar a nova senha
    const hashNovaSenha = await bcrypt.hash(novaSenha, 8);

    // Atualizar a senha no banco de dados usando o Sequelize
    const user = await post.findOne({ where: { email: usuarioId } });

    if (user) {
      user.pass = hashNovaSenha;
      await user.save();

      console.log("Senha atualizada com sucesso");
      res.redirect("/profile");
    } else {
      console.log("Usuário não encontrado");
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    console.log("Erro ao atualizar senha:", error);
    res.status(500).send("Erro ao atualizar senha");
  }
});

router.get('/carrinho', (req,res)=>{
  if (req.isAuthenticated()) {
    userLoggedIn = true;
  }
  res.render('cart', userLoggedIn)
}) 

router.get('/profile/pedidos' , (req,res)=>{
  if (req.isAuthenticated()) {
    userLoggedIn = true;
  }
  res.render('user_historic', userLoggedIn)
})


router.post('/carrinho/adicionar/:ProdutoId', async (req, res) => {
  const produtoId = req.params.ProdutoId;
  const UserId = req.user.UserId;  // Supõe que o cliente esteja logado e seu ID esteja na sessão
  const quantidade = req.body.quantidade || 1;

  // Busca ou cria um pedido 'ativo' para o cliente
    let pedido = await Pedido.findOrCreate({
      where: { UserId: UserId, Status: 'ativo' },
      defaults: { UserId: UserId, Status: 'ativo' }
    });


  console.log("Buscando produto com ID:", produtoId)
  // Busca o produto pelo ID
  const produto = await Produto.findByPk(produtoId);
  console.log("Produto encontrado:", produto);


  if (!produto) {
    console.error(`Nenhum produto encontrado com ID: ${produtoId}`);
    return res.status(404).send("Produto não encontrado");
}

  const [item, created] = await Pedido_Produto.findOrCreate({
      where: { PedidoPedidoId: pedido[0].PedidoId, produtoProdutoId: produtoId },
      defaults: { Quantidade: quantidade, PrecoUnitario: produto.valor },
      transaction: t
  });

  if (!created) {
      item.Quantidade += quantidade;
      item.PrecoUnitario = produto.valor;
      await item.save({ transaction: t });
  }

  await atualizarTotalPedido(pedido[0].PedidoId, t);  // Passando a transação como argumento

if (!resultado) {
  console.log('erro de transação');
}

  res.json({message: "produto adicionado com sucesso ao carrinho"});
});

function verificaAutenticacao(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/login"); //redirecionar para /login quando o usuário não estiver logado
  }
}

function logUserId(req, res, next) {
  if (req.isAuthenticated()) { // Verifica se o método isAuthenticated está disponível e o usuário está logado
      console.log(`Usuário logado com ID: ${req.user.UserId}`); // Acessa o ID do usuário armazenado na sessão
  } else {
      console.log("Nenhum usuário logado.");
  }
  next(); // Continua para a próxima função de middleware na pilha
}

async function atualizarTotalPedido(PedidoId){
  const itens = await Pedido_Produto.findAll({
    where:{PedidoPedidoId: PedidoId}
  });
  let total = 0;
  itens.forEach(item =>{
    total += item.Quantidade * item.PrecoUnitario;
  });
  const pedido = await Pedido.findByPk(pedidoId);
    pedido.Total = total;
    await pedido.save();

}
module.exports = router;

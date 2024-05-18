const express = require("express");
const router = express.Router();
const Produto = require("./models/produto");
const Pedido = require('./models/pedido')
const User = require("./models/User");
const db = require("./models/banco");
const path = require("path");
const Pedido_Produto = require('./models/pedido_produto');
const bcrypt = require("bcryptjs");
const passport = require("./config/auth");
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/images/') // Caminho da pasta onde os arquivos serão salvos
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });


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
router.post("/cadastrarProduto", upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo foi enviado.');
  }

  const imageName = req.file.filename; // Nome do arquivo salvo na pasta img

  // Criação do Produto com o nome do arquivo de imagem
  Produto.create({
    imagem: imageName,  // Salva o nome do arquivo no banco de dados
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
    res.status(500).send("Erro ao processar o cadastro do produto.");
  });
});

module.exports = router;

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

router.get('/carrinho', async (req,res)=>{
  let userLoggedIn = false;
  
  if (req.isAuthenticated()) {
    userLoggedIn = true;
    try {
      // Supondo que o modelo de Pedido armazene uma referência ao UserId
      const pedido = await Pedido.findOne({
        where: { UserId: req.user.UserId, Status: 'ativo' }, // Ajuste o campo conforme seu modelo
        include: [{
          model: Pedido_Produto,
          include: [Produto]
        }]
      });

      console.log("Pedido encontrado:", pedido);
        if (pedido) {
          console.log("Pedido_Produtos:", pedido.Pedido_Produtos);
          pedido.Pedido_Produtos.forEach(pp => {
          console.log("Produto associado:", pp.ProdutoId);
          });
        }

      const produtos = pedido ? pedido.Pedido_Produtos.map(item => {
        if (!item.produto) {
          console.error("Produto não encontrado para o Pedido_Produto com ID:", item.ProdutoId);
          return {}; // Ou pode retornar um objeto de produto padrão ou nulo
        }

        return{
          nome: item.produto.nome,
          descricao: item.produto.descricao,
          imagem: item.produto.imagem,
          valor: item.produto.valor,
          quantidade: item.Quantidade,
          ProdutoId: item.produtoId
      };
      }) : [];

      console.log("Produtos a serem renderizados:", produtos);

      res.render('cart', {
        userLoggedIn: req.isAuthenticated,
        produtos: produtos  // Passando produtos para a view
      });
    } catch (error) {
      console.error("Erro ao buscar dados do carrinho:", error);
      res.status(500).send("Erro ao processar o pedido de carrinho.");
    }
  } else {
    res.render('cart', { userLoggedIn: userLoggedIn });
  }
});

router.get('/profile/pedidos' , (req,res)=>{
  if (req.isAuthenticated()) {
    userLoggedIn = true;
  }
  res.render('user_historic', userLoggedIn)
})


router.post('/carrinho/adicionar/:produtoId', async (req, res) => {
  const produtoId = req.params.produtoId;
  const UserId = req.user.UserId;  // Supõe que o cliente esteja logado e seu ID esteja na sessão
  const quantidade = parseInt(req.body.quantidade) || 1;

  try{
    // Busca ou cria um pedido 'ativo' para o cliente
      const [pedido, pedidoCreated] = await Pedido.findOrCreate({
        where: { UserId: UserId, Status: 'ativo' },
        defaults: { UserId: UserId, Status: 'ativo' }
      });


    // Busca o produto pelo ID
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      console.error(`Nenhum produto encontrado com ID: ${produtoId}`);
      return res.status(404).send("Produto não encontrado");
  }

    const [item, itemCreated] = await Pedido_Produto.findOrCreate({
        where: { PedidoId: pedido.PedidoId, ProdutoId: produtoId },
        defaults: { Quantidade: quantidade, PrecoUnitario: produto.valor },
    });

    if (!itemCreated) {
        item.Quantidade += quantidade;
        await item.save();
    }

    const itens = await Pedido_Produto.findAll({
      where:{PedidoId: pedido.PedidoId}
    });

    const total = itens.reduce((acc, curr)=> acc + (curr.Quantidade * curr.PrecoUnitario), 0);
    pedido.Total = total;
    await pedido.save();

    res.json({message: "produto adicionado com sucesso ao carrinho"});
  }catch(error){
    console.error("erro ao adicionar produto ao carrinho", error);
    res.status(500).send("erro interno do servidor")
  }
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

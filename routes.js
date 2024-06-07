const express = require("express");
const router = express.Router();
const Produto = require("./models/produto");
const Pedido = require('./models/pedido')
const User = require("./models/User");
const db = require("./models/banco");
const path = require("path");
const Pedido_Produto = require('./models/pedido_produto');
const bcrypt = require("bcryptjs");
const { passport, authMiddleware } = require("./config/auth");
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

router.use(authMiddleware);

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
router.get("/", authMiddleware, (req, res) => {
  Produto
    .findAll()
    .then((produtos) => {
      res.render("index", { Produto: produtos});
    })
    .catch((erro) => {
      console.log("erro ao buscar produtos" + erro);
      res.status(500).send("Erro ao buscar usuarios");
    });

    
});

// Rota para cadastrar produto
router.get("/cadastrarProduto", authMiddleware,(req, res) => {
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
router.get("/consultar", authMiddleware,(req, res) => {
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
router.get("/editar/:id", authMiddleware,function (req, res) {
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
router.get("/painelAdm", authMiddleware,(req, res)=>{
  res.render("painelAdm")
})

//rota painel Gernete
router.get("/painelGerente", authMiddleware,(req, res)=>{
  res.render("painelGerente")
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
router.get("/profile", authMiddleware,(req, res) => {
  
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

router.post("/atualizarUsuario",async(req,res)=>{
  try{
    const userId = req.user.UserId;
    const {nome,endereco,cpf,email,telefone} = req.body;
    const user = await User.findByPk(userId);
    if(!user){
      return res.status(404).json({ message: "Usuario nao encontrado. "})
    }
    user.nome = nome;
    user.endereco = endereco;
    user.cpf = cpf;
    user.email = email;
    user.telefone = telefone;

    await user.save();
    res.redirect('/profile')
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor ao atualizar dados do usuário." });
  }
})

router.get("/profile", authMiddleware,(req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json({});
  }
});

router.get("/logout",authMiddleware, (req, res, next) => {
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

router.get("/s", authMiddleware, (req, res) => {
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

router.get('/carrinho', authMiddleware, async (req, res) => {
  try {
      // Supondo que o modelo de Pedido armazene uma referência ao UserId
      const pedido = await Pedido.findOne({
          where: { UserId: req.user.UserId, Status: 'ativo' }, // Ajuste o campo conforme seu modelo
          include: [{
              model: Pedido_Produto,
              include: [Produto]
          }]
      });

      if (!pedido) {
          return res.render('cart', { produtos: [], subtotal: 0.00 }); // Mostra carrinho vazio se não houver pedido
      }

      console.log("Pedido encontrado:", pedido);
      
      const produtos = pedido.Pedido_Produtos.map(item => {
          if (!item.produto) {
              console.error("Produto não encontrado para o Pedido_Produto com ID:", item.ProdutoId);
              return {}; // Retorna um objeto vazio ou padrão se não encontrar o produto
          }

          return {
              nome: item.produto.nome,
              descricao: item.produto.descricao,
              imagem: item.produto.imagem,
              valor: item.produto.valor,
              quantidade: item.Quantidade,
              ProdutoId: item.ProdutoId
          };
      });

      console.log("Produtos a serem renderizados:", produtos);

      // Calcula o subtotal
      const subtotal = produtos.reduce((acc, curr) => acc + (curr.quantidade * curr.valor), 0);

      // Passando produtos e subtotal para a view
      res.render('cart', {
          produtos: produtos,
          subtotal: subtotal.toFixed(2)  // Formata o subtotal para ter duas casas decimais
      });
  } catch (error) {
      console.error("Erro ao buscar dados do carrinho:", error);
      res.status(500).send("Erro ao processar o pedido de carrinho.");
  }
});

  
// Atualizar a quantidade do produto
router.post('/carrinho/update/:produtoId', async (req, res) => {
  const { produtoId } = req.params;
  const { quantity } = req.body;

  try {
      const item = await Pedido_Produto.findOne({
          where: { ProdutoId: produtoId },
          include: [{model: Produto}]
      });

      if (!item) {
          return res.status(404).send("Produto não encontrado.");
      }

      item.Quantidade = quantity;
      await item.save();

      // Recalcula o subtotal após a atualização
      const pedido = await Pedido.findOne({
          where: { PedidoId: item.PedidoId },
          include: [Pedido_Produto]
      });

      const subtotal = pedido.Pedido_Produtos.reduce((acc, curr) => {
        if (!curr.Produto) {
            console.error("Produto não encontrado para o Pedido_Produto com ID:", curr.ProdutoId);
            return acc; // Retorna o acumulador sem adicionar nada se o produto não existir
        }
        return acc + (curr.Quantidade * curr.Produto.valor);
    }, 0);

      await pedido.update({ Total: subtotal });

      res.json({ success: true, newSubtotal: subtotal });
  } catch (error) {
      console.error('Erro ao atualizar carrinho:', error);
      res.status(500).send("Erro ao processar a atualização do carrinho.");
  }
});

router.get('/profile/pedidos',authMiddleware,  (req,res)=>{
  res.render('user_historic')
})


//rota para adicionar ao carrinho

router.post('/carrinho/adicionar/:produtoId', async (req, res) => {
  const produtoId = req.params.produtoId;
  const UserId = req.session.clienteId;  // Supõe que o cliente esteja logado e seu ID esteja na sessão
  const quantidade = req.body.quantidade || 1;

  console.log()

  // Busca ou cria um pedido 'ativo' para o cliente
  let pedido = await Pedido.findOrCreate({
    where: { UserId: UserId, Status: 'ativo' },
    defaults: { UserId: UserId, Status: 'ativo' }
  });

  // Busca o produto pelo ID
  const produto = await Produto.findByPk(produtoId);

  // Adiciona ou atualiza o produto no carrinho
  const [item, created] = await Pedido_Produto.findOrCreate({
    where: { PedidoId: pedido[0].id, ProdutoId: produtoId },
    defaults: { Quantidade: quantidade, PrecoUnitario: produto.Preco }
  });

  if (!created) {
    item.Quantidade += quantidade;
    await item.save();
  }

  res.redirect('/carrinho');
});

//rota para pagina de obrigado
router.get("/thanku", (req, res) => {
  res.render("thankU");
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

const express = require("express");
const router = express.Router();
const Produto = require("./models/produto");
const Pedido = require("./models/pedido");
const User = require("./models/User");
const Pedido_Produto = require("./models/pedido_produto");
const bcrypt = require("bcryptjs");
const { passport, authMiddleware } = require("./config/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Middleware de Autenticação
router.use(authMiddleware);

passport.serializeUser((user, done) => {
  done(null, user.UserId);
});

passport.deserializeUser((UserId, done) => {
  User.findByPk(UserId, (err, user) => {
    if (err) {
      return done(err);
    }
    return done(null, user);
  });
});

// Rota inicial
router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.findAll();
    res.render("index", { Produto: produtos });
  } catch (erro) {
    console.error("Erro ao buscar produtos", erro);
    res.status(500).send("Erro ao buscar produtos");
  }
});

// Rota para cadastrar produto
router.get("/cadastrarProduto", (req, res) => {
  res.render("cadProduto");
});

router.post("/cadastrarProduto", upload.single("imagem"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("Nenhum arquivo foi enviado.");
    }
    const imageName = req.file.filename;
    await Produto.create({
      imagem: imageName,
      nome: req.body.nome,
      valor: req.body.valor,
      descricao: req.body.descricao,
      categoria: req.body.categoria,
    });
    res.redirect("/cadastrarProduto");
  } catch (erro) {
    console.error("Falha ao cadastrar os dados", erro);
    res.status(500).send("Erro ao processar o cadastro do produto.");
  }
});

// Rota para consultar
router.get("/consultar", async (req, res) => {
  try {
    const produtos = await Produto.findAll();
    res.render("consultar", { Produto: produtos });
  } catch (erro) {
    console.error("Falha ao consultar os dados", erro);
    res.status(500).send("Erro ao consultar os dados.");
  }
});

// Rota para editar produto
router.get("/editar/:id", async (req, res) => {
  try {
    const produtos = await Produto.findAll({ where: { id: req.params.id } });
    res.render("editarProduto", { Produto: produtos });
  } catch (erro) {
    console.error("Falha ao acessar a página editar", erro);
    res.status(500).send("Erro ao acessar a página editar.");
  }
});

router.post("/atualizar", async (req, res) => {
  try {
    await Produto.update(
      {
        imagem: req.body.imagem,
        nome: req.body.nome,
        valor: req.body.valor,
        descricao: req.body.descricao,
        categoria: req.body.categoria,
      },
      { where: { id: req.body.id } }
    );
    res.redirect("/consultar");
  } catch (erro) {
    console.error("Falha ao atualizar os dados", erro);
    res.status(500).send("Erro ao atualizar os dados.");
  }
});

// Rota para excluir produto
router.get("/excluir/:id", async (req, res) => {
  try {
    await Produto.destroy({ where: { id: req.params.id } });
    res.redirect("/consultar");
  } catch (erro) {
    console.error("Erro ao excluir", erro);
    res.status(500).send("Erro ao excluir.");
  }
});

// Rota de cadastro de usuário
router.get("/signin", (req, res) => {
  res.render("signin");
});

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

    if (req.body.password !== req.body.confirmPassword) {
      return res.render("signin", {
        message: "As senhas não coincidem!",
        name: req.body.name,
        cpf: req.body.cpf,
        email: req.body.email,
      });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 8);
    await User.create({
      nome: req.body.name,
      email: req.body.email,
      cpf: req.body.cpf,
      password: hashPassword,
    });

    res.redirect(
      "/login?success=Usuário cadastrado com sucesso! Faça o login agora."
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).send("Erro ao criar usuário.");
  }
});

// Rota painel ADM
router.get("/painelAdm", (req, res) => {
  res.render("painelAdm");
});

//rota painel Gernete
router.get("/painelGerente", authMiddleware,(req, res)=>{
  res.render("painelGerente")
})


//rota login
router.get("/login", (req, res) => {
  const successMessage = req.query.success;
  const email = req.query.email || ""; // Adicione esta linha para passar o valor do campo de email, se estiver presente na query
  const errorMessage = req.query.errorMessage || ""; // Adicione esta linha para passar a mensagem de erro, se estiver presente na query
  res.render("login", { successMessage, email, errorMessage }); // Adicione email e errorMessage ao objeto passado para a renderização da página
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (req.body.email === "admkrusty@krusty.com.br" && req.body.password === "admkrusty01") {
    return res.redirect("/painelAdm");
  }
  try {
    // Verificar se o email existe no banco de dados
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      // Se o email não existir, enviar a mensagem de erro para a página de login
      const errorMessage = "Não existe cadastro com o e-mail fornecido! <br> <a href='/signin'>Cadastre-se clicando aqui!</a>";
      return res.render("login", { errorMessage, email }); // Passar o email de volta para a página de login
    }

    // Se o email existir, verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      // Se a senha não coincidir, enviar a mensagem de erro para a página de login
      const errorMessage = "Email e senha não coincidem.";
      return res.render("login", { errorMessage, email }); // Passar o email de volta para a página de login
    }

    // Autenticar usuário
    req.login(existingUser, (err) => {
      if (err) {
        console.error("Erro ao fazer login:", err);
        return res.status(500).send("Erro ao fazer login");
      }
      // Redirecionar para a página de perfil após o login bem-sucedido
      return res.redirect("/profile");
    });
  } catch (error) {
    // Tratar erros de forma adequada
    console.error("Erro ao fazer login:", error);
    res.status(500).send("Erro ao fazer login");
  }
});


// Rota para renderizar a página de perfil
router.get("/profile", async (req, res) => {
  if (req.isAuthenticated()) {
    const userlogado = req.user;
    const { nome, email, cpf, endereco, telefone } = userlogado;
    const dadosUser = { nome, email, cpf, endereco, telefone }; // Adicionando o endereço e o telefone
    const userLoggedIn = true;
    res.render("user_info", { dadosUser, userLoggedIn });
  } else {
    res.redirect("/login");
  }
});

router.post("/atualizarUsuario", upload.single("foto"), async (req, res) => {
  try {
    const userId = req.user.UserId;
    const { nome, endereco, cpf, email, telefone } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    if (req.file) {
      user.foto = req.file.filename;
    }

    user.nome = nome;
    user.endereco = endereco;
    user.cpf = cpf;
    user.email = email;
    user.telefone = telefone;

    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    res
      .status(500)
      .json({
        error: "Erro interno do servidor ao atualizar dados do usuário.",
      });
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
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});

// Rota para alterar senha
router.get("/alterar-senha", (req, res) => {
  res.render("alterar-senha");
});

router.post("/alterar-senha", async (req, res) => {
  try {
    const userId = req.user.UserId;
    const { nome, endereco, cpf, email, telefone } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    user.nome = nome;
    user.endereco = endereco;
    user.cpf = cpf;
    user.email = email;
    user.telefone = telefone;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    res
      .status(500)
      .json({
        error: "Erro interno do servidor ao atualizar dados do usuário.",
      });
  }
});

// Rota para exibir os pedidos do usuário
router.get("/pedidos", async (req, res) => {
  try {
    const userId = req.user.UserId;
    const pedidos = await Pedido.findAll({
      where: { UserId: userId },
      include: [Produto],
    });
    res.render("pedidos", { pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).send("Erro ao buscar pedidos");
  }
});

// Rota para criar um novo pedido
router.post("/criarPedido", async (req, res) => {
  try {
    const userId = req.user.UserId;
    const { produtos } = req.body;
    const novoPedido = await Pedido.create({ UserId: userId });
    for (const produtoId of produtos) {
      const produto = await Produto.findByPk(produtoId);
      if (produto) {
        await Pedido_Produto.create({
          PedidoId: novoPedido.id,
          ProdutoId: produto.id,
          quantidade: 1,
          preco: produto.valor,
        });
      }
    }
    res.redirect("/pedidos");
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).send("Erro ao criar pedido");
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

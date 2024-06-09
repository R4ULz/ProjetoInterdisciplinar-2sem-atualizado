const express = require("express");
const router = express.Router();
const Produto = require("./models/produto");
const Pedido = require('./models/pedido')
const User = require("./models/User");
const db = require("./models/banco");
const path = require("path");
const Pedido_Produto = require('./models/pedido_produto');
const Gerente = require("./models/gerente");
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

//rota login
router.get("/login", (req, res) => {
  const successMessage = req.query.success;
  const email = req.query.email || ""; // Adicione esta linha para passar o valor do campo de email, se estiver presente na query
  const errorMessage = req.query.errorMessage || ""; // Adicione esta linha para passar a mensagem de erro, se estiver presente na query
  res.render("login", { successMessage, email, errorMessage }); // Adicione email e errorMessage ao objeto passado para a renderização da página
});

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
  if (email.endsWith("@gerencia.com.br")) {
    // Redirecionar para a página de painel de gerente
    return res.redirect("/painelGerente");
  }
  // const existingGerente = await Gerente.findOne({ where: { email } });
  // if (!existingGerente) {
  //   // Se o email não existir, enviar a mensagem de erro para a página de login
  //   const errorMessage = "Não existe cadastro com o e-mail fornecido!";
  //   return res.render("login", { errorMessage, email });
  // }
  // const isPasswordValid = await bcrypt.compare(password, existingGerente.senha);

  // if (!isPasswordValid) {
  //   // Se a senha não coincidir, enviar a mensagem de erro para a página de login
  //   const errorMessage = "Email e senha não coincidem.";
  //   return res.render("login", { errorMessage, email });
  // }

  // // Redirecionar para o painel de gerentes após o login bem-sucedido
  // res.redirect("/painelGerente");
  try {
    // Verificar se o email existe no banco de dados
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      // Se o email não existir, enviar a mensagem de erro para a página de login
      const errorMessage = "Não existe cadastro com o e-mail fornecido!" + "<br> <a href='/signin'> Cadastre-se clicando aqui!</a>";
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

// Rota para o painel de gerente
router.get("/painelGerente", authMiddleware, (req, res) => {
  res.render("painelGerente");
});


// Rota para renderizar a página de perfil
router.get("/profile", authMiddleware,(req, res) => {
  
  if (req.isAuthenticated()) {
    const  userlogado  = req.user;
    const {nome, email, cpf,  endereco, telefone} = userlogado
    const dadosUser = {nome,email,cpf, endereco, telefone}
    const userLoggedIn = true;
    res.render("user_info",  {dadosUser ,userLoggedIn});
  } else {
    // Se o usuário não estiver autenticado, redirecione-o para a página de login
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

// Rota para alterar senha
router.get("/alterar-senha", (req, res) => {
  res.render("alterar-senha");
});

router.post("/alterar-senha", authMiddleware, async (req, res) => {
  const {novaSenha, confirmaSenha} = req.body;
  if(novaSenha !== confirmaSenha){
    return alert("Senhas não são iguais")
  }

  const userId = req.user.UserId;
  const user = await User.findByPk(userId);

  const salt = await bcrypt.genSalt(10)
  const hashedSenha = await bcrypt.hash(novaSenha, salt)

  user.password = hashedSenha
  await user.save()

  res.redirect("/profile")
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


router.post('/carrinho/adicionar/:produtoId', async (req, res) => {
  const produtoId = req.params.produtoId;
  const quantidade = parseInt(req.body.quantidade) || 1;

  try {
      const produto = await Produto.findByPk(produtoId);
      if (!produto) {
          console.error(`Nenhum produto encontrado com ID: ${produtoId}`);
          return res.status(404).json({ success: false, message: "Produto não encontrado" });
      }

      res.json({
          success: true,
          message: "Produto obtido com sucesso",
          produto: {
              produtoId: produto.ProdutoId, // Confirme se é produto.id ou produto.produtoId
              nome: produto.nome,
              precoUnitario: produto.valor, // Confirme se é produto.valor
              imagem: produto.imagem
          },
          quantidade: quantidade
      });
  } catch (error) {
      console.error("Erro ao buscar produto:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor", error: error.toString() });
  }
});

router.get("/thanku", (req, res) => {
  res.render("thankU");
});


router.post('/confirmarPedido', async (req, res) => {
  const { carrinho } = req.body;  // O carrinho é esperado como { produtoId: { quantidade, precoUnitario, ... }, ... }

  try {
      const novoPedido = await Pedido.create({
          UserId: req.user.id,  // Asumindo que o usuário está autenticado e seu id está disponível
          status: 'Confirmado',
          // outros campos necessários
      });

      for (const produtoId in carrinho) {
          const { quantidade, precoUnitario } = carrinho[produtoId];
          await PedidoProduto.create({
              PedidoId: novoPedido.id,
              ProdutoId: produtoId,
              quantidade: quantidade,
              precoUnitario: precoUnitario,
          });
      }

      res.json({ success: true, message: 'Pedido confirmado com sucesso!' });
  } catch (error) {
      console.error('Erro ao salvar o pedido:', error);
      res.status(500).json({ success: false, message: 'Erro ao processar o pedido.' });
  }
});

router.get("/gerenciarGerente", (req,res)=>{
  res.render("cadastrarGerente")
})

router.post("/cadastrarG", async (req,res)=>{
  try {
    const existingUser = await Gerente.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.render("cadastrarGerente", {
        message: "Esse email está em uso!",
        name: req.body.name,
        turno: req.body.turno,
        email: req.body.email,
      });
    }

    if (req.body.senha !== req.body.confirmPassword) {
      return res.render("/gerenciarGerente", {
        message: "As senhas não coincidem!",
        name: req.body.name,
        turno: req.body.turno,
        email: req.body.email,
      });
    }

    const hashPassword = await bcrypt.hash(req.body.senha,8);
    await Gerente.create({
      nome: req.body.name,
      email: req.body.email,
      turno: req.body.turno,
      senha: hashPassword,
    });

    res.redirect(
      "/login?success=Usuário cadastrado com sucesso! Faça o login agora."
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).send("Erro ao criar usuário.");
  }
})

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

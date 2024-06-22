const express = require("express");
const router = express.Router();
const db = require("./models/banco");
const path = require("path");
const { Sequelize } = require('sequelize');
const { Pedido, Pedido_Produto, Produto, User} = require('./models');
const bcrypt = require("bcryptjs");
const { passport, authMiddleware } = require("./config/auth");
const checkRole = require('./middlewares/verificaRole');
const multer = require("multer");
const fs = require('fs');
const Jimp = require('jimp');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/"); // Caminho da pasta onde os arquivos serão salvos
  }});

  function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return Jimp.rgbaToInt(r, g, b, 255);
  }
  
  async function generateProfilePic(initial) {
    const backgroundColor = getRandomColor(); // Gera uma cor de fundo aleatória
    const image = new Jimp(128, 128, backgroundColor); // Cria uma imagem com fundo colorido aleatório
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE); // Carrega uma fonte branca de tamanho 64
    const shadowFont = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); // Fonte preta para sombra
  
    // Calcula as dimensões do texto para centralizar
    const textWidth = Jimp.measureText(font, initial);
    const textHeight = Jimp.measureTextHeight(font, initial, 128);
  
    // Adiciona sombra
    image.print(
      shadowFont,
      (image.bitmap.width - textWidth) / 2 + 2,
      (image.bitmap.height - textHeight) / 2 + 2,
      {
        text: initial,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      textWidth,
      textHeight
    );
  
    // Adiciona texto principal
    image.print(
      font,
      (image.bitmap.width - textWidth) / 2,
      (image.bitmap.height - textHeight) / 2,
      {
        text: initial,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      textWidth,
      textHeight
    );
  
    const fileName = `profile_${Date.now()}.png`;
    const filePath = path.join(__dirname, 'public/profile_pics', fileName);
  
    await image.writeAsync(filePath);
    return fileName;
  }

const upload = multer({ storage: storage });

router.use(authMiddleware);

passport.serializeUser((user, done) => {
  console.log("Serializando", user.UserId);
  done(null, user.UserId);
});

passport.deserializeUser((UserId, done) => {
  console.log("Desserializando ID:", UserId);
  User.findById(UserId, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false); // O usuário não foi encontrado
    }
    return done(null, user);
  });
});

//config do bodyparser para leitura do post

// Rota inicial
router.get("/", (req, res) => {
  Produto.findAll()
    .then((produtos) => {
      res.render("index", { Produto: produtos });
    })
    .catch((erro) => {
      console.log("erro ao buscar produtos" + erro);
      res.status(500).send("Erro ao buscar usuarios");
    });
});

// Rota para buscar categorias disponíveis
router.get('/categorias', async (req, res) => {
  try {
      const categorias = await Produto.findAll({
          attributes: ['categoria'],
          group: ['categoria']
      });
      res.json(categorias);
  } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
});

// Rota para buscar produtos por categoria
router.get('/produtos/:categoria?', async (req, res) => {
  const { categoria } = req.params;
  try {
    let produtos;
    if (categoria) {
      produtos = await Produto.findAll({ where: { categoria } });
    } else {
      produtos = await Produto.findAll();
    }
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro ao buscar produtos');
  }
});


// Rota para cadastrar produto
router.get("/cadastrarProduto", authMiddleware, checkRole(['manager', 'admin']), (req, res) => {
  res.render("cadProduto");
});

// Rota POST para cadastrar produto
router.post("/cadastrarProduto",authMiddleware, checkRole(['manager', 'admin']), upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }
  const imageName = req.file.filename; // Nome do arquivo salvo na pasta img
  // Criação do Produto com o nome do arquivo de imagem
  Produto.create({
    imagem: imageName, // Salva o nome do arquivo no banco de dados
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
//rota sobre nós
router.get("/sobre", (req,res)=>{
  res.render("sobre");
});

//rota para consultar
router.get("/consultar", authMiddleware, checkRole(['manager', 'admin']),(req, res) => {
  Produto.findAll()
    .then((produtos) => {
      res.render("consultar", { Produto: produtos });
    })
    .catch(function (erro) {
      res.send("Falha ao consultar os dados: " + erro);
    });
});

//rota para editar
router.get("/editar/:id", authMiddleware, checkRole(['manager', 'admin']), function (req, res) {
  Produto.findAll({ where: { ProdutoId: req.params.id } })
    .then(function (produtos) {
      res.render("editarProduto", { Produto: produtos });
    })
    .catch(function (erro) {
      res.send("Falha ao acessar a pagina editar: " + erro);
    });
});

//metodo para atualizar da rota editar
router.post("/atualizar", authMiddleware, checkRole(['manager', 'admin']), function (req, res) {
  Produto.update(
    {
      imagem: req.body.imagem,
      nome: req.body.nome,
      valor: req.body.valor,
      descricao: req.body.descricao,
      categoria: req.body.categoria,
    },
    { where: { ProdutoId: req.body.id } }
  )
    .then(function () {
      res.redirect("/consultar");
    })
    .catch(function (erro) {
      res.send("Falha ao atualizar os dados: " + erro);
    });
});

// botão pra excluir
router.get("/excluir/:id", authMiddleware, checkRole(['manager', 'admin']),function (req, res) {
  Produto.destroy({ where: { ProdutoId: req.params.id } })
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

// Função para obter uma imagem de perfil aleatória
function getRandomProfilePic() {
  const directoryPath = path.join(__dirname, 'public/profile_pics');
  const files = fs.readdirSync(directoryPath);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  return randomFile;
}

//metodo post do signin
router.post("/signin", async (req, res) => {
  try {
    const { name, telefone, endereco, cpf, email, password, confirmPassword } = req.body;
    const randomPic = getRandomProfilePic();

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.render("signin", {
        message:
          "Esse email está em uso! <a href='/login' class='text-blue-500 hover:underline'>Clique aqui para logar</a>",
        name: req.body.name,
        telefone: req.body.telefone,
        endereco: req.body.endereco,
        cpf: req.body.cpf,
        email: req.body.email,
        foto: randomPic // Salvar o nome do arquivo da imagem como foto de perfil
      });
    }

    const existingCpfUser = await User.findOne({
      where: { cpf: req.body.cpf },
    });

    if (existingCpfUser) {
      return res.render("signin", {
        message:
          "O CPF fornecido já está cadastrado! <br> <a href='/login' class='text-blue-500 hover:underline'>Clique aqui para logar</a>",
        name: req.body.name,
        telefone: req.body.telefone,
        endereco: req.body.endereco,
        cpf: req.body.cpf,
        email: req.body.email,
      });
    }

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

    // Remove a máscara de CPF
    const cpfUnmasked = cpf.replace(/\D/g, "");

    // Cria o hash da senha
    const hashPassword = await bcrypt.hash(password, 8);

    // Gera a imagem de perfil com a letra inicial do nome
    const initial = name.charAt(0).toUpperCase();
    const profilePic = await generateProfilePic(initial);

    // Cria o usuário no banco de dados
    await User.create({
      nome: req.body.name,
      email: req.body.email,
      telefone: req.body.telefone,
      endereco: req.body.endereco,
      cpf: cpfUnmasked,
      password: hashPassword,
      foto: profilePic
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
router.get("/painelAdm", authMiddleware, checkRole(['admin']), (req, res) => {
  res.render("painelAdm");
});

//rota login
router.get("/login", (req, res) => {
  const successMessage = req.query.success;
  const email = req.query.email || ""; 
  const errorMessage = req.query.errorMessage || ""; 
  res.render("login", { successMessage, email, errorMessage });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Verificar se o email existe no banco de dados
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      // Se o email não existir, enviar a mensagem de erro para a página de login
      const errorMessage =
        "Não existe cadastro com o e-mail fornecido!" +
        "<br> <a href='/signin' class='text-blue-500 hover:underline'>Cadastre-se clicando aqui!</a>";
      return res.render("login", { errorMessage, email });
    }

    // Se o email existir, verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      // Se a senha não coincidir, enviar a mensagem de erro para a página de login
      const errorMessage = "Email e senha não coincidem.";
      return res.render("login", { errorMessage, email });
    }

    // Autenticar usuário
    req.login(existingUser, (err) => {
      if (err) {
        console.error("Erro ao fazer login:", err);
        return res.status(500).send("Erro ao fazer login");
      }

      // Redirecionar com base na role do usuário
      switch (existingUser.role) {
        case 'admin':
          return res.redirect("/painelAdm");
        case 'manager':
          return res.redirect("/painelGerente");
        default:
          return res.redirect("/profile");
      }
    });
  } catch (error) {
    // Tratar erros de forma adequada
    console.error("Erro ao fazer login:", error);
    res.status(500).send("Erro ao fazer login");
  }
});

// Rota para o painel de gerente
router.get("/painelGerente", authMiddleware, checkRole(['manager', 'admin']), (req, res) => {
  res.render("painelGerente");
});

// Rota para renderizar a página de perfil
router.get("/profile", authMiddleware, checkRole(['user', 'manager', 'admin']), async (req, res) => {
  if (req.isAuthenticated()) {
    const userlogado = req.user;
    const { nome, email, cpf, endereco, telefone, foto } = userlogado;
    const dadosUser = { nome, email, cpf, endereco, telefone, foto };
    const userLoggedIn = true;
    res.render("user_info", { dadosUser, userLoggedIn });
  } else {
    res.redirect("/login");
  }
});

router.post("/atualizarUsuario", authMiddleware, checkRole(['user', 'manager', 'admin']), upload.single("foto"), async (req, res) => {
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
    res.status(500).json({
      error: "Erro interno do servidor ao atualizar dados do usuário.",
    });
  }
});

router.get("/profile", authMiddleware, checkRole(['user', 'manager', 'admin']), (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json({});
  }
});

router.get("/logout", authMiddleware, checkRole(['user', 'manager', 'admin']), (req, res, next) => {
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
router.get("/alterar-senha", authMiddleware, checkRole(['user', 'manager', 'admin']),(req, res) => {
  res.render("alterar-senha");
});

router.post("/alterar-senha", authMiddleware, checkRole(['user', 'manager', 'admin']), async (req, res) => {
  const { novaSenha, confirmaSenha } = req.body;
  if (novaSenha !== confirmaSenha) {
    return alert("Senhas não são iguais");
  }

  const userId = req.user.UserId;
  const user = await User.findByPk(userId);

  const salt = await bcrypt.genSalt(10);
  const hashedSenha = await bcrypt.hash(novaSenha, salt);

  user.password = hashedSenha;
  await user.save();

  res.redirect("/profile");
});

router.get("/carrinho", async (req, res) => {
  try {
    let pedido = null;
    let produtos = [];
    let subtotal = 0;

    if (req.isAuthenticated && req.isAuthenticated()) {
      // Usuário autenticado
      pedido = await Pedido.findOne({
        where: { UserId: req.user.UserId, Status: "ativo" }, // Ajuste o campo conforme seu modelo
        include: [
          {
            model: Pedido_Produto,
            as: 'pedido_produtos', // Usando o alias correto
            include: [
              {
                model: Produto,
                as: 'Produto' // Usando o alias correto
              }
            ]
          }
        ]
      });

      if (pedido) {
        console.log("Pedido encontrado:", JSON.stringify(pedido, null, 2));

        produtos = pedido.pedido_produtos.map((item) => {
          if (!item.Produto) {
            console.error(
              "Produto não encontrado para o Pedido_Produto com ID:",
              item.ProdutoId
            );
            return {}; // Retorna um objeto vazio ou padrão se não encontrar o produto
          }

          return {
            nome: item.Produto.nome,
            descricao: item.Produto.descricao,
            imagem: item.Produto.imagem,
            valor: item.Produto.valor,
            quantidade: item.Quantidade,
            ProdutoId: item.ProdutoId,
          };
        });

        console.log("Produtos a serem renderizados:", produtos);

        // Calcula o subtotal
        subtotal = produtos.reduce(
          (acc, curr) => acc + curr.quantidade * curr.valor,
          0
        );
      }
    } else {
      // Usuário não autenticado
      const carrinho = JSON.parse(req.session.carrinho || '{}');
      produtos = Object.keys(carrinho).map(produtoId => {
        const produto = carrinho[produtoId];
        subtotal += produto.quantidade * produto.precoUnitario;
        return {
          nome: produto.nome,
          descricao: produto.descricao,
          imagem: produto.imagem,
          valor: produto.precoUnitario,
          quantidade: produto.quantidade,
          ProdutoId: produtoId,
        };
      });

      console.log("Produtos do carrinho não autenticado:", produtos);
    }

    // Passando produtos e subtotal para a view
    res.render("cart", {
      produtos: produtos,
      subtotal: subtotal.toFixed(2), // Formata o subtotal para ter duas casas decimais
    });
  } catch (error) {
    console.error("Erro ao buscar dados do carrinho:", error);
    res.status(500).send("Erro ao processar o pedido de carrinho.");
  }
});


// Atualizar a quantidade do produto
router.post("/carrinho/update/:produtoId", async (req, res) => {
  const { produtoId } = req.params;
  const { quantity } = req.body;

  try {
    const item = await Pedido_Produto.findOne({
      where: { ProdutoId: produtoId },
      include: [{ model: Produto }],
    });

    if (!item) {
      return res.status(404).send("Produto não encontrado.");
    }

    item.Quantidade = quantity;
    await item.save();

    // Recalcula o subtotal após a atualização
    const pedido = await Pedido.findOne({
      where: { PedidoId: item.PedidoId },
      include: [Pedido_Produto],
    });

    const subtotal = pedido.Pedido_Produtos.reduce((acc, curr) => {
      if (!curr.Produto) {
        console.error(
          "Produto não encontrado para o Pedido_Produto com ID:",
          curr.ProdutoId
        );
        return acc; // Retorna o acumulador sem adicionar nada se o produto não existir
      }
      return acc + curr.Quantidade * curr.Produto.valor;
    }, 0);

    await pedido.update({ Total: subtotal });

    res.json({ success: true, newSubtotal: subtotal });
  } catch (error) {
    console.error("Erro ao atualizar carrinho:", error);
    res.status(500).send("Erro ao processar a atualização do carrinho.");
  }
});

router.get("/profile/pedidos", authMiddleware, checkRole(['user']), (req, res) => {
  res.render("user_historic");
});

router.post("/carrinho/adicionar/:produtoId", async (req, res) => {
  const produtoId = req.params.produtoId;
  const quantidade = parseInt(req.body.quantidade) || 1;

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      console.error(`Nenhum produto encontrado com ID: ${produtoId}`);
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }

    res.json({
      success: true,
      message: "Produto obtido com sucesso",
      produto: {
        produtoId: produto.ProdutoId, // Confirme se é produto.id ou produto.produtoId
        nome: produto.nome,
        precoUnitario: produto.valor, // Confirme se é produto.valor
        imagem: produto.imagem,
      },
      quantidade: quantidade,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.toString(),
    });
  }
});

router.post('/api/pedidos', authMiddleware, checkRole(['user']), async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: 'Usuário não autenticado' });
  }

  const { carrinho, total } = req.body;
  if (!carrinho) {
    return res.status(400).json({ success: false, message: 'Carrinho vazio' });
  }

  console.log("Total recebido:", total);
  console.log("Carrinho recebido:", carrinho);
  try {
    // Criar novo pedido com total
    const novoPedido = await Pedido.create({
      UserId: req.user.UserId,
      Status: 'Preparando',
      Total: total  // Certifique-se de que total está sendo passado corretamente
    })

      const produtosPedido = Object.entries(carrinho).map(([produtoId, produto]) => ({
      PedidoId: novoPedido.PedidoId,
      ProdutoId: parseInt(produtoId),
      Quantidade: produto.quantidade,
      PrecoUnitario: produto.precoUnitario
    }));

    await Pedido_Produto.bulkCreate(produtosPedido);

    res.json({ success: true, message: 'Pedido criado com sucesso!', pedidoId: novoPedido.PedidoId });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar o pedido.' });
  }
});

router.get('/api/meus-pedidos', authMiddleware, checkRole(['user']), async (req, res) => {
  try {
    const userId = req.user.UserId;
    const pedidos = await Pedido.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Pedido_Produto,
          as: 'pedido_produtos',
          include: [{
            model: Produto,
            as: 'Produto'
          }]
        }
      ],
      attributes: [
        'PedidoId',
        'Status',
        'createdAt',
        'Total'
      ],
      group: ['Pedido.PedidoId', 'pedido_produtos.PedidoId', 'pedido_produtos.ProdutoId', 'pedido_produtos.PedidoId']
    });

    // Log detalhado da estrutura dos dados retornados
    console.log("Pedidos encontrados:", JSON.stringify(pedidos, null, 2));

    res.json({ success: true, pedidos: pedidos });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar a solicitação.' });
  }
});

router.get('/api/check-auth', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});
//aaaaaa
router.get("/gerenciarGerentes", authMiddleware, checkRole(['manager', 'admin']), (req, res) => {
  res.render("gerenciarGerente");
});

router.get("/consultarGerentes", authMiddleware, checkRole(['manager', 'admin']), (req, res) => {
  res.render("consultarGerente");
});

router.get("/cadastrarGerentes", authMiddleware, checkRole(['admin']), (req, res) => {
  res.render("cadastrarGerente");
});

router.post("/cadastrarG", authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { name, cpf, email, senha, confirmPassword } = req.body;
    const randomPic = getRandomProfilePic(); // Função para obter uma imagem de perfil aleatória

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("cadastrarGerente", {
        message: "Esse email está em uso!",
        nome: name,
        email,
        cpf
      });
    }

    // Verifica se o CPF já está cadastrado
    const existingCpfUser = await User.findOne({ where: { cpf } });
    if (existingCpfUser) {
      return res.render("cadastrarGerente", {
        message: "O CPF fornecido já está cadastrado!",
        nome: name,
        cpf,
        email
      });
    }

    // Verifica se as senhas são iguais
    if (senha !== confirmPassword) {
      return res.render("cadastrarGerente", {
        message: "As senhas não coincidem!",
        nome: name,
        email,
        cpf
      });
    }

    // Remove a máscara de CPF
    const cpfUnmasked = cpf.replace(/\D/g, "");

    // Cria o hash da senha
    const hashPassword = await bcrypt.hash(senha, 8);

    // Cria o usuário no banco de dados com o role de 'manager'
    await User.create({
      nome: name,
      email,
      cpf: cpfUnmasked,
      password: hashPassword,
      foto: randomPic,  // Salvar o nome do arquivo da imagem como foto de perfil
      role: 'manager'  // Especificando que este usuário é um gerente
    });
    console.log("Gerente cadastrado com sucesso no banco de dados!");
    res.redirect("/gerenciarGerentes?success=Usuário cadastrado com sucesso! Faça o login agora.");
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).send("Erro ao criar usuário.");
  }
});

router.get("/gerenciarPedidos", authMiddleware, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const pedidos = await Pedido.findAll(); // Busca todos os pedidos
    res.json(pedidos); // Renderiza a página de lista de pedidos com os dados
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).send("Erro ao acessar os pedidos.");
  }
});

router.post('/api/cancelar-pedido/:pedidoId', async (req, res) => {
  const { pedidoId } = req.params;
  try {
    const pedido = await Pedido.findByPk(pedidoId);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
    }
    // Supondo que 'Cancelado' é um status válido em seu sistema
    pedido.Status = 'Cancelado';
    await pedido.save();
    res.json({ success: true, message: 'Pedido cancelado com sucesso.' });
  } catch (error) {
    console.error('Erro ao cancelar o pedido:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar a solicitação.' });
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
  if (req.isAuthenticated()) {
    // Verifica se o método isAuthenticated está disponível e o usuário está logado
    console.log(`Usuário logado com ID: ${req.user.UserId}`); // Acessa o ID do usuário armazenado na sessão
  } else {
    console.log("Nenhum usuário logado.");
  }
  next(); // Continua para a próxima função de middleware na pilha
}

async function atualizarTotalPedido(PedidoId) {
  const itens = await Pedido_Produto.findAll({
    where: { PedidoPedidoId: PedidoId },
  });
  let total = 0;
  itens.forEach((item) => {
    total += item.Quantidade * item.PrecoUnitario;
  });
  const pedido = await Pedido.findByPk(pedidoId);
  pedido.Total = total;
  await pedido.save();
}
module.exports = router;

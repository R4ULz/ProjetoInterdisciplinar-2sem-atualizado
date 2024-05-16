const express = require("express");
const router = express.Router();
const produto = require("./models/produto");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const passport = require("./config/auth");
const LocalStrategy = require("passport-local").Strategy;
//require do body-parser para pegar os dados do form

// passport.use(
//   new LocalStrategy(
//     { usernameField: "email" },
//     async (email, password, done) => {
//       try {
//         const user = await User.findOne({ email });
//         if (!user) {
//           return done(null, false, { message: "Usuario nao encontrado" });
//         }
//         const isValidPassword = await bcrypt.compare(password, user.password);

//         if (!isValidPassword) {
//           return done(null, false, { message: "Senha incorreta" });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

//config do bodyparser para leitura do post

// Rota inicial
router.get("/", (req, res) => {
  produto
    .findAll()
    .then((produtos) => {
      res.render("index", { produto: produtos });
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
  produto
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
  produto
    .findAll()
    .then((produtos) => {
      console.log("cheghei aquii");
      res.render("consultar", { produto: produtos });
    })
    .catch(function (erro) {
      res.send("Falha ao consultar os dados: " + erro);
    });
});

//rota para editar
router.get("/editar/:id", function (req, res) {
  produto
    .findAll({ where: { id: req.params.id } })
    .then(function (produtos) {
      res.render("editarProduto", { produto: produtos });
    })
    .catch(function (erro) {
      res.send("Falha ao acessar a pagina editar: " + erro);
    });
});

//metodo para atualizar da rota editar
router.post("/atualizar", function (req, res) {
  produto
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
  produto
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


router.post("/signin", async (req, res) => {
  const { email } = req.body; // Extrai o email do corpo da requisição

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.render("signin", {
        message: "Este email já está em uso!",
      });
    } else {
      const { name, email, cpf, password } = req.body;
      if (!password) {
        return res.status(400).send("Senha não fornecida");
      }

      const hashPassword = await bcrypt.hash(password, 8);
      await User.create({
        nome: name,
        email: email,
        cpf: cpf,
        password: hashPassword,
      });

      res.redirect("/login");
    }
  } catch (error) {
    console.error("Erro ao cadastrar os dados:", error);
    return res.status(500).send("Erro ao criar usuário");
  }
});

//rota login
router.get("/login", (req, res) => {
  res.render("login");
});

//método post do login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true,
  })
);

// Rota para renderizar a página de perfil
router.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    const  userlogado  = req.user;
    const {nome, email, cpf} = userlogado
    const dadosUser = {nome,email,cpf}
    console.log("AJUDA",  dadosUser)
    res.render("user_info",  dadosUser);
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

//     // post.findAll({where: {"id" : req.params.id}}).then((posts)=>{
//     // res.render('user_info', {post:posts})
// // try {
// //   const usuario = req.session.user;
// //   res.render('user_info', { post });
// // } catch (error) {
// //   console.log("Erro ao renderizar o perfil:", error);
// //   res.status(500).send("Erro ao renderizar o perfil");
// // }

// });

// Rota de logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// try {
//   const usuario = req.session.user;
//   res.render('user_info', { post });
// } catch (error) {
//   console.log("Erro ao renderizar o perfil:", error);
//   res.status(500).send("Erro ao renderizar o perfil");
// }

// {
//   // Pega os valores digitados pelo usuário

//   const {email, pass} = req.body;
//   try {
//     // Procurar usuário pelo email fornecido
//     const user = await post.findOne({ where: { email } });

//     if (user) {
//       // Se o usuário for encontrado, comparar a senha fornecida com a senha armazenada usando bcrypt
//       const hashedPass = user.pass;
//       const match = await bcrypt.compare(pass, hashedPass);

//       if (match) {
//         // Se as senhas corresponderem, o login é bem-sucedido
//         req.session.user = email;
//         console.log("Login feito com sucesso!");
//         res.redirect("/user/perfil/:id");
//       } else {
//         // Se as senhas não corresponderem, retornar uma mensagem de erro
//         console.log("Login incorreto!");
//         res.render("login", {
//           message: "Login incorreto! Verifique suas credenciais e tente novamente"
//         });
//       }
//     } else {
//       // Se o usuário não for encontrado, retornar uma mensagem de erro
//       console.log("Este email não existe!");
//       res.render("login", {
//         message: "Este email não existe!"
//       });
//     }
//   } catch (error) {
//     // Se ocorrer algum erro durante a consulta ao banco de dados, retornar uma mensagem de erro
//     console.log("Erro ao consultar banco de dados:", error);
//     res.status(500).send("Erro interno ao fazer login");
//   }
// });

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
      res.redirect("/perfil");
    } else {
      console.log("Usuário não encontrado");
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    console.log("Erro ao atualizar senha:", error);
    res.status(500).send("Erro ao atualizar senha");
  }
});

function verificaAutenticacao(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/login"); //redirecionar para /login quando o usuário não estiver logado
  }
}

module.exports = router;

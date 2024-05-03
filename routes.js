const express = require('express');
const router = express.Router();
const produto = require('./models/produto');
const User = require('./models/models').User;
const bcrypt = require('bcryptjs');
const passport = require('./config/auth')
//require do body-parser para pegar os dados do form


//config do bodyparser para leitura do post


// Rota inicial
router.get("/", (req, res) => {
  produto.findAll().then((produtos) => {
    res.render("index", { produto: produtos });
  }).catch((erro) => {
    console.log("erro ao buscar produtos" + erro);
    res.status(500).send("Erro ao buscar usuarios");
  })
});

// Rota para cadastrar produto
router.get("/cadastrarProduto", (req, res) => {
  res.render("cadProduto");
});

// Rota POST para cadastrar produto
router.post("/cadastrarProduto", (req, res) => {
  produto.create({
    imagem: req.body.imagem,
    nome: req.body.nome,
    valor: req.body.valor,
    descricao: req.body.descricao,
    categoria: req.body.categoria,
  }).then(() => {
    res.redirect("/cadastrarProduto");
  }).catch((erro) => {
    console.log("Falha ao cadastrar os dados" + erro);
  });
});

//rota para consultar
router.get("/consultar", (req, res)=>{
    produto.findAll().then((produtos)=>{
      console.log("cheghei aquii")
      res.render("consultar", {produto: produtos})
    }).catch(function(erro){
      res.send("Falha ao consultar os dados: " + erro)
    })
  });
  
  //rota para editar
  router.get("/editar/:id", function(req, res){
    produto.findAll({where: {"id": req.params.id}}).then(function(produtos){
      res.render("editarProduto", {produto: produtos})
    }).catch(function(erro){
        res.send("Falha ao acessar a pagina editar: " + erro)
    })
  })
  
  //metodo para atualizar da rota editar
  router.post("/atualizar", function(req, res){
    produto.update({
        imagem: req.body.imagem,
        nome: req.body.nome,
        valor: req.body.valor,
        descricao: req.body.descricao,
        categoria: req.body.categoria
    }, {where: {id: req.body.id}}).then(function(){
        res.redirect("/consultar")
    }).catch(function(erro){
        res.send("Falha ao atualizar os dados: " + erro)
    })
  })
  
  // botão pra excluir
  router.get("/excluir/:id", function(req, res){
    produto.destroy({where: {"id": req.params.id}}).then(function(){
        res.redirect("/consultar")
    }).catch(function(erro){
        res.send("erro ao excluir"+erro)
    })
  })
  
  //rota cadastro
  router.get("/signin", (req, res) => {
    res.render("signin");
  });
  
  //metodo post do signin
  router.post("/signin", async (req, res) => {
  
    const existingPost = await User.findOne({where: {email : req.body.email}})
  
    if(existingPost){
      return res.render('signin', {
        message: 'Esse email está em uso!'
        })
    }else{
    let password = req.body.password;
    if (!password) {
      return res.status(400).send('Senha não fornecida');
    }
  
    try {
      let hashPassword = await bcrypt.hash(password, 8);
      User.create({
        nome: req.body.name,
        email: req.body.email,
        cpf: req.body.cpf,
        password: hashPassword
        
      }).then(()=>{
        res.redirect('/login')
      }).catch((erro) =>{
        console.log("Falha ao cadastrar os dados " + erro)
      })
    } catch (error) {
      console.error('Erro ao gerar hash da senha:', error);
      return res.status(500).send('Erro ao criar hash da senha');
    }
  }});
  
  
  //rota login
  router.get("/login", (req, res) => {
    res.render("login",{message: null});
  });
  
  //método post do login
  router.post("/login", passport.authenticate("local",{
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })) 
  
  
  router.get("/profile", verificaAutenticacao, (req,res) =>{
  
      res.render('user_info', {user: req.user})
  
      // post.findAll({where: {"id" : req.params.id}}).then((posts)=>{
      // res.render('user_info', {post:posts})
  // try {
  //   const usuario = req.session.user;
  //   res.render('user_info', { post });
  // } catch (error) {
  //   console.log("Erro ao renderizar o perfil:", error);
  //   res.status(500).send("Erro ao renderizar o perfil");
  // }
     
  });
  
  // Rota de logout
  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
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
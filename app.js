//require das dependencias do projeto
const express = require("express");
const app = express();
const {passport, authMiddleware} = require("./config/auth");
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");
const handlebars = require("express-handlebars").engine;
const routes = require("./routes"); // Importando as rotas
const bodyParser = require("body-parser");
const {db} = require('./models');
const cors = require('cors');
const addUserData = require('./middlewares/addUserData');
const Handlebars = require('handlebars');



//const { resolveSOA } = require("dns");

//criando a sessão
app.use(session({
  secret: 'your_secret_key', // Use uma chave secreta forte e única
  resave: false,             // Não salva a sessão de volta ao armazenamento de sessão, se não foi modificada
  saveUninitialized: false,  // Não cria sessão até que algo seja armazenado
  cookie: {
    httpOnly: true,
    secure: false, // Configure como true se estiver usando HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 horas, por exemplo
  }
}));

app.use(flash());

// Middleware para configurar variáveis globais
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//configurando os middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(authMiddleware);


//config engines
app.engine("handlebars", handlebars({ 
  defaultLayout: "main", 
  layoutsDir:path.join(__dirname, '/views/layouts/'), 
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    formatCurrency: function(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    limit: function(arr, limit) {
      if (!Array.isArray(arr)) { return []; }
      return arr.slice(0, limit);
  }
  }
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set("view engine", "handlebars");

//definindo acesso a pasta publica
app.use(express.static("public"));

app.use(cors({
  origin: 'http://localhost:3000'
}));

//config do bodyparser para leitura do post
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function createAdminUser() {
  const adminExists = await db.User.findOne({ where: { email: "admin@example.com" } });
  if (!adminExists) {
    const hashPassword = await bcrypt.hash("admkrusty01", 8); // Use uma senha mais segura
    await db.User.create({
      nome: "Admin",
      email: "admkrusty@krusty.com",
      cpf: "00000000000",
      password: hashPassword,
      role: "admin",
    });
    console.log("Conta de administrador criada!");
  }
}

db.sequelize.sync({}) // Use force: true com cautela em produção
  .then(() => {
    console.log("Banco de dados sincronizado.");
    // Outras operações de inicialização podem ocorrer aqui
  })
  .catch(err => {
    console.error("Erro ao sincronizar o banco de dados:", err);
});

app.use(addUserData);  // Middleware global para adicionar dados do usuário


app.use(routes);

//executa servidor
app.listen("3000", () => {
  console.log("Server on");
});

// Configure esta função para ser executada em intervalos regulares

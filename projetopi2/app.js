//require das dependencias do projeto
const express = require("express");
const app = express();
const passport = require("./config/auth");
const session = require("express-session");
const path = require("path");
const User  = require("./models/User");
const produto = require("./models/produto");
const bcrypt = require("bcryptjs");
const flash = require("express-flash");
const handlebars = require("express-handlebars").engine;
const routes = require("./routes"); // Importando as rotas
const bodyParser = require("body-parser");

//const { resolveSOA } = require("dns");

//criando a sessão
app.use(
  session({
    secret: "sua-chave-secreta",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

//configurando o middleware de sessão
app.use(passport.initialize());
app.use(passport.session());

//config engines
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//definindo acesso a pasta publica
app.use(express.static("public"));

//config do bodyparser para leitura do post
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(routes);

//executa servidor
app.listen("3000", () => {
  console.log("Server on");
});
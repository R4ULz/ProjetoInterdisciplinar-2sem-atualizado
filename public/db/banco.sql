CREATE DATABASE teste_login;

use teste_login;

CREATE TABLE IF NOT EXISTS users(
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR (100) NOT NULL,
    email VARCHAR (100) NOT NULL,
    cpf VARCHAR(100) NOT NULL,
    pass VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos(
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nomeProduto VARCHAR (100) NOT NULL,
     VARCHAR (100) NOT NULL,
    cpf VARCHAR(100) NOT NULL,
    pass VARCHAR(100) NOT NULL
);
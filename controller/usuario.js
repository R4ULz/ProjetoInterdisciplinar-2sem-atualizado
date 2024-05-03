const { json } = require("body-parser");
const model = require("../models");
const Users = model.Users;

module.exports = {
    async criarUsuario(req,res){
        
        try{
            const {
                nome,
                email,
                passHash,
                endereco,
                telefone
            } = req.body;

            const existeEmail = await model.users.findAll({where: {email : req.body.email}})
            
            if(existeEmail){
                return res.render('signin', {
                  message: 'Esse email está em uso!'
                  })
            }else{
                const SalvarUsuario = await Users.create({
                    nome,
                    email,
                    passHash,
                    endereco,
                    telefone
                });
                SalvarUsuario.senha_hash = undefined;
                return res.redirect('/login');
            }
        }catch(err){
            return res.send("Erro ao cadastrar usuário" + err);
        }
    }

}
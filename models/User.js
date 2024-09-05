const db = require("./banco");
const bcrypt = require('bcryptjs');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// Definição do modelo User
const User = db.sequelize.define("User", {
  UserId: {
    type: db.Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  foto: {
    type: db.Sequelize.STRING,
    allowNull: true,
  },
  nome: { 
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  endereco: {
    type: db.Sequelize.STRING,
    allowNull: true,
  },
  telefone: {
    type: db.Sequelize.STRING,
    allowNull: true,
  },
  cpf: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: db.Sequelize.STRING,
    defaultValue: 'user',
    allowNull: false,
  }
});

// Função para gerar uma imagem de perfil
async function generateProfilePic(initial) {
  const backgroundColor = getRandomColor();
  const image = new Jimp(128, 128, backgroundColor);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  const shadowFont = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);

  const textWidth = Jimp.measureText(font, initial);
  const textHeight = Jimp.measureTextHeight(font, initial, 128);

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
  const filePath = path.join(__dirname, '../public/profile_pics', fileName);

  await image.writeAsync(filePath);
  return fileName;
}

// Função para gerar uma cor aleatória
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return Jimp.rgbaToInt(r, g, b, 255);
}

// Função para criar o usuário admin
async function createAdmin() {
  try {
    await db.sequelize.sync(); // Sincroniza os modelos com o banco de dados
    const admin = await User.findOne({ where: { email: "admkrusty@krusty.com" } });
    if (!admin) {
      const hashPassword = await bcrypt.hash("admkrusty01", 8);
      const adminProfilePic = await generateProfilePic('A');
      await User.create({
        foto: adminProfilePic,
        nome: "Admin",
        email: "admkrusty@krusty.com",
        cpf: "00000000000",
        password: hashPassword,
        role: "admin",
      });
      console.log("Administrador criado com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao criar administrador: ", error);
  }
}

// Chama a função para garantir que o administrador seja criado
createAdmin();

module.exports = User;

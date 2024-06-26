
// Funcionamento Menu Mobile
const btnMenu = document.getElementById("cesta");
const menuMobile = document.getElementById("menu-mobile");
const menuMobileLogged = document.getElementById("menu-mobile-logged")

btnMenu.addEventListener("click", () => {
  menuMobile.classList.toggle("disable-menu");
  menuMobile.classList.toggle("active-menu");
  (menuMobile.classList.contains('active-menu')) ? setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0) : document.removeEventListener("click", handleOutsideClick);
});

btnMenu.addEventListener("click", () => {
  menuMobileLogged.classList.toggle("disable-menu");
  menuMobileLogged.classList.toggle("active-menu-logged");
  (menuMobileLogged.classList.contains('active-menu-logged')) ? setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0) : document.removeEventListener("click", handleOutsideClick);
});

const handleOutsideClick = (event) => {
  const target = event.target;
  if (menuMobile.contains(target) || btnMenu.contains(target)) return;
  menuMobile.classList.remove("active-menu");
  menuMobile.classList.add("disable-menu");
  document.removeEventListener("click", handleOutsideClick);
};


//Menu se fecha quando clicar em algumas das opções
const opcoes = document.querySelectorAll(".menu-option")
opcoes.forEach(opcao =>{
  opcao.addEventListener("click", ()=>{
    menuMobile.classList.remove("active-menu");
    menuMobile.classList.add("disable-menu");
  })
})
const menuOptionsLogged = document.querySelectorAll('.menu-option-logged');
menuOptionsLogged.forEach(option => {
  option.addEventListener('click', () => {
    menuMobileLogged.classList.remove("active-menu-logged");
    menuMobileLogged.classList.add("disable-menu");
  });
});


//Menu com Draggable
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.draggable');
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1; 
    slider.scrollLeft = scrollLeft - walk;
  });
});

function atualizarQuantidadeNoIconeCarrinho() {
  const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};
  let totalItens = 0;
  Object.values(carrinho).forEach(item => {
    totalItens += item.quantidade;  // somando a quantidade de cada item
  });

  const carrinhoIconeQuantidade = document.querySelector('#carrinho-icone-quantidade'); // supondo que você tem um elemento com este ID
  if (carrinhoIconeQuantidade) {
    carrinhoIconeQuantidade.textContent = totalItens;  // atualizando o texto do elemento
  }
}


//Funcionamento Produtos
const lancheImg = document.querySelector('.lanche-item--img');
const lancheTitle = document.querySelector('.lanche-item--title');
const lancheDesc = document.querySelector('.lanche-item--desc');
const lanchePrice = document.querySelector('.lanche-item--price');



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


//Funcionamento Produtos
const lancheImg = document.querySelector('.lanche-item--img');
const lancheTitle = document.querySelector('.lanche-item--title');
const lancheDesc = document.querySelector('.lanche-item--desc');
const lanchePrice = document.querySelector('.lanche-item--price');

// js do pagamento
document.getElementById("card-number").addEventListener("input", function (e) {
  let input = e.target;
  let value = input.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
  if (value.length > 16) value = value.slice(0, 16); // Limita a 16 caracteres

  let formattedValue = value.match(/.{1,4}/g)?.join(" ") ?? ""; // Formata o valor

  input.value = formattedValue;
});

document.getElementById("CVV").addEventListener("input", function (e) {
  let input = e.target;
  input.value = input.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
});

document.addEventListener("DOMContentLoaded", function () {
  const monthSelect = document.getElementById("exp-month");
  const yearSelect = document.getElementById("exp-year");
  const currentYear = new Date().getFullYear();

  // Populate month select
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    option.value = month.toString().padStart(2, "0"); // Format as "01", "02", etc.
    option.textContent = month.toString().padStart(2, "0");
    monthSelect.appendChild(option);
  }

  // Populate year select
  for (let year = currentYear; year <= currentYear + 10; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
});

//modal pagamento
document.addEventListener("DOMContentLoaded", function() {
  let formCard = document.getElementById("formCard");
  let formSlip = document.getElementById("formSlip");

  let credito = document.getElementById("credito");
  let debito = document.getElementById("debito");
  let boleto = document.getElementById("boleto");

  let modalCard = document.getElementById("modalCard");
  let btnPedir = document.getElementById("btnPedir");
  let header = document.getElementById("header");
  let footer = document.getElementById("footer");
  let arrow = document.getElementById("arrow");

  let options = [credito, debito, boleto];

  //quando apertar em pedido, verifica quem contem a classe active para 
  btnPedir.addEventListener("click", () => {
      showModal(modalCard);
      //quando clicar em uma das opções ele tira de todas e coloca na opção apertada
  options.forEach(option => {
    option.addEventListener("click", function() {
        options.forEach(opt => opt.classList.remove("active", "border", "border-[#EF4444]"));
        this.classList.add("active", "border", "border-[#EF4444]");
        if (credito.classList.contains("active") || debito.classList.contains("active")) {
          showCards(formCard);
          closeSlip(formSlip);
      } 
        if (boleto.classList.contains("active")) {
          showSlip(formSlip);
          closeCards(formCard);
      }
  });
    });
});
     
  arrow.addEventListener("click", () => {
      closeModal(modalCard);
  });

  function showModal(modal) {
      modal.classList.remove("hidden");
      modal.classList.add("opacity-100", "pointer-events-auto", "z-10");
      header.classList.add("pointer-events-none", "z-0");
      footer.classList.add("pointer-events-none", "z-0");
  }

  function closeModal(modal) {
      modal.classList.add("hidden");
      modal.classList.remove("opacity-100", "pointer-events-auto", "z-10");
      header.classList.remove("pointer-events-none", "z-0");
      footer.classList.remove("pointer-events-none", "z-0");
  }

  //mostrar conteudo de cartões
  function showCards(formsCard){
      formsCard.classList.remove("opacity-0", "hidden");
      formsCard.classList.add("opacity-100", "pointer-events-auto", "z-10");
  }

  function closeCards(formsCard){
      formsCard.classList.add("opacity-0", "hidden");
      formsCard.classList.remove("opacity-100", "pointer-events-auto", "z-10");
  }

  //mostrar conteudo de boleto
  function showSlip(slip){
      slip.classList.remove("opacity-0", "hidden");
      slip.classList.add("opacity-100", "pointer-events-auto", "z-10");
  }

  function closeSlip(slip){
      slip.classList.add("opacity-0", "hidden");
      slip.classList.remove("opacity-100", "pointer-events-auto", "z-10");
  }

});


// Interação do formulário de contato do portfólio.
const formulario = document.getElementById("formulario-contato");
const mensagem = document.getElementById("mensagem");
const status = document.getElementById("status");

mensagem.addEventListener("input", () => {
  status.textContent = `${mensagem.value.length} caracteres digitados`;
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  status.textContent = "Obrigado pela mensagem! (envio real chega no capítulo 15)";
  formulario.reset();
});

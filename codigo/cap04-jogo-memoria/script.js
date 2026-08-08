// ============================================================
// Jogo da Memória — JavaScript puro (capítulo 4)
// Algoritmos: Fisher-Yates shuffle + lógica de pares + tempo
// ============================================================

const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐙", "🦄"];
const GRID = document.getElementById("grade");
const JOGADAS = document.getElementById("jogadas");
const TEMPO = document.getElementById("tempo");
const RECORDE = document.getElementById("recorde");
const BOTAO = document.getElementById("reiniciar");

let cartas = [];
let primeira = null;
let bloqueado = false;
let jogadas = 0;
let paresEncontrados = 0;
let segundos = 0;
let cronometro = null;

// --- Algoritmo útil nº 1: embaralhamento de Fisher-Yates ---
function embaralhar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]]; // troca destruturada
  }
  return lista;
}

function montarBaralho() {
  // cada emoji aparece 2x (um par)
  cartas = embaralhar([...EMOJIS, ...EMOJIS]);
}

function criarGrade() {
  GRID.innerHTML = "";
  montarBaralho();
  cartas.forEach((emoji, indice) => {
    const botao = document.createElement("button");
    botao.className = "carta";
    botao.dataset.indice = String(indice);
    botao.setAttribute("aria-label", "Carta virada, clique para revelar");
    botao.addEventListener("click", () => virarCarta(botao, emoji));
    GRID.appendChild(botao);
  });
}

function virarCarta(botao, emoji) {
  if (bloqueado || botao.classList.contains("virada")) return;

  botao.textContent = emoji;
  botao.classList.add("virada");
  botao.setAttribute("aria-label", `Carta com ${emoji}`);

  if (primeira === null) {
    primeira = { botao, emoji };
    return;
  }

  jogadas++;
  JOGADAS.textContent = String(jogadas);

  const segunda = { botao, emoji };
  const acertou = primeira.emoji === segunda.emoji;

  if (acertou) {
    primeira.botao.classList.add("par");
    segunda.botao.classList.add("par");
    paresEncontrados++;
    primeira = null;
    if (paresEncontrados === EMOJIS.length) finalizar();
    return;
  }

  bloqueado = true;
  setTimeout(() => {
    primeira.botao.textContent = "";
    primeira.botao.classList.remove("virada");
    primeira.botao.setAttribute("aria-label", "Carta virada, clique para revelar");
    segunda.botao.textContent = "";
    segunda.botao.classList.remove("virada");
    segunda.botao.setAttribute("aria-label", "Carta virada, clique para revelar");
    primeira = null;
    bloqueado = false;
  }, 700);
}

function iniciarCronometro() {
  cronometro = setInterval(() => {
    segundos++;
    TEMPO.textContent = formatarTempo(segundos);
  }, 1000);
}

function formatarTempo(total) {
  const min = Math.floor(total / 60);
  const s = total % 60;
  return `${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function finalizar() {
  clearInterval(cronometro);
  const recordeAtual = Number(localStorage.getItem("recorde-memoria") || 0);
  if (recordeAtual === 0 || jogadas < recordeAtual) {
    localStorage.setItem("recorde-memoria", String(jogadas));
  }
  RECORDE.textContent = `Recorde: ${localStorage.getItem("recorde-memoria")} jogadas`;
  setTimeout(() => alert(`Você venceu em ${jogadas} jogadas e ${formatarTempo(segundos)}!`), 300);
}

function reiniciar() {
  clearInterval(cronometro);
  jogadas = 0;
  segundos = 0;
  paresEncontrados = 0;
  primeira = null;
  bloqueado = false;
  JOGADAS.textContent = "0";
  TEMPO.textContent = "00:00";
  criarGrade();
  iniciarCronometro();
}

BOTAO.addEventListener("click", reiniciar);
RECORDE.textContent = `Recorde: ${localStorage.getItem("recorde-memoria") || "-"} jogadas`;
criarGrade();
iniciarCronometro();

"use strict";

const CATEGORIAS = [
  "Ficção",
  "Fantasia",
  "Terror",
  "Drama",
  "Romance",
  "Aventura",
  "Distopia",
  "Academicos",
  "Infantil",
  "Quadrinhos",
  "Outros",
];

const livros = [];
let proximoId = 1;

function obterElemento(id) {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }
  return elemento;
}
const formulario = obterElemento("form-livro");
const campoTitulo = obterElemento("titulo");
const campoAutor = obterElemento("autor");
const campoCategoria = obterElemento("categoria");
const campoAno = obterElemento("ano");
const campoLido = obterElemento("lido");
const campoBusca = obterElemento("busca");
const filtroCategoria = obterElemento("filtro-categoria");
const listaLivros = obterElemento("lista");
const mensagemVazio = obterElemento("mensagem-vazio");
const resumoTotal = obterElemento("total");
const resumoLidos = obterElemento("lidos");
const resumoNaoLidos = obterElemento("nao-lidos");

function validarFormulario(titulo, autor, categoria, anoTexto) {
  const erros = {};
  const anoAtual = new Date().getFullYear();
  if (titulo.trim() === "") {
    erros.titulo = "Informe o título do livro.";
  }
  if (autor.trim() === "") {
    erros.autor = "Informe o autor do livro.";
  }
  if (categoria === "") {
    erros.categoria = "Selecione uma categoria.";
  }
  if (anoTexto.trim() === "") {
    erros.ano = "Informe o ano de publicação.";
  } else {
    const ano = Number(anoTexto);
    if (Number.isNaN(ano) || !Number.isInteger(ano)) {
      erros.ano = "O ano deve ser um número inteiro.";
    } else if (ano < 1000 || ano > anoAtual) {
      erros.ano = `Informe um ano entre 1000 e ${anoAtual}.`;
    }
  }
  return { valido: Object.keys(erros).length === 0, erros };
}
function mostrarErros(erros) {
  const campos = [
    ["titulo", campoTitulo],
    ["autor", campoAutor],
    ["categoria", campoCategoria],
    ["ano", campoAno],
  ];
  for (const [nome, elemento] of campos) {
    const mensagem = erros[nome] ?? "";
    obterElemento(`erro-${nome}`).textContent = mensagem;
    elemento.classList.toggle("invalido", mensagem !== "");
  }
}

function criarLivro(titulo, autor, categoria, ano, lido) {
  return {
    id: proximoId++,
    titulo: titulo.trim(),
    autor: autor.trim(),
    categoria,
    ano,
    lido,
  };
}
function adicionarLivro(livro) {
  livros.push(livro);
}
function alternarEstado(id) {
  const livro = livros.find((l) => l.id === id);
  if (livro !== undefined) {
    livro.lido = !livro.lido;
  }
}
function removerLivro(id) {
  const indice = livros.findIndex((l) => l.id === id);
  if (indice !== -1) {
    livros.splice(indice, 1);
  }
}
function filtrarLivros(termo, categoria) {
  const termoNormalizado = termo.trim().toLowerCase();
  return livros.filter((livro) => {
    const bateTitulo = livro.titulo.toLowerCase().includes(termoNormalizado);
    const bateCategoria = categoria === "" || livro.categoria === categoria;
    return bateTitulo && bateCategoria;
  });
}
function calcularResumo() {
  const lidos = livros.filter((l) => l.lido).length;
  return { total: livros.length, lidos, naoLidos: livros.length - lidos };
}
function ehCategoria(valor) {
  return CATEGORIAS.includes(valor);
}

function criarCard(livro) {
  const item = document.createElement("li");
  item.className = livro.lido ? "card lido" : "card";
  const titulo = document.createElement("h3");
  titulo.textContent = livro.titulo;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${livro.autor} • ${livro.categoria} • ${livro.ano}`;
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = livro.lido ? "Lido" : "Não lido";
  const acoes = document.createElement("div");
  acoes.className = "acoes";
  const botaoEstado = document.createElement("button");
  botaoEstado.type = "button";
  botaoEstado.textContent = livro.lido
    ? "Marcar como não lido"
    : "Marcar como lido";
  botaoEstado.addEventListener("click", () => {
    alternarEstado(livro.id);
    atualizarTela();
  });
  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "btn-excluir";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => {
    removerLivro(livro.id);
    atualizarTela();
  });
  acoes.append(botaoEstado, botaoExcluir);
  item.append(titulo, meta, badge, acoes);
  return item;
}
function renderizarLista() {
  const resultado = filtrarLivros(campoBusca.value, filtroCategoria.value);
  listaLivros.replaceChildren(...resultado.map(criarCard));
  if (livros.length === 0) {
    mensagemVazio.textContent =
      "Nenhum livro cadastrado ainda. Use o formulário acima para adicionar o primeiro!";
    mensagemVazio.hidden = false;
  } else if (resultado.length === 0) {
    mensagemVazio.textContent =
      "Nenhum livro encontrado para a busca ou filtro informado.";
    mensagemVazio.hidden = false;
  } else {
    mensagemVazio.hidden = true;
  }
}
function renderizarResumo() {
  const resumo = calcularResumo();
  resumoTotal.textContent = String(resumo.total);
  resumoLidos.textContent = String(resumo.lidos);
  resumoNaoLidos.textContent = String(resumo.naoLidos);
}
function atualizarTela() {
  renderizarLista();
  renderizarResumo();
}
// ===== 7. EVENTOS =====
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const validacao = validarFormulario(
    campoTitulo.value,
    campoAutor.value,
    campoCategoria.value,
    campoAno.value,
  );
  mostrarErros(validacao.erros);
  if (!validacao.valido || !ehCategoria(campoCategoria.value)) {
    return;
  }
  const novoLivro = criarLivro(
    campoTitulo.value,
    campoAutor.value,
    campoCategoria.value,
    Number(campoAno.value),
    campoLido.checked,
  );
  adicionarLivro(novoLivro);
  formulario.reset();
  campoTitulo.focus();
  atualizarTela();
});
campoBusca.addEventListener("input", renderizarLista);
filtroCategoria.addEventListener("change", renderizarLista);
// Estado inicial da tela
atualizarTela();

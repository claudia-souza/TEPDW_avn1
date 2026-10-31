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
] as const;

type Categoria = (typeof CATEGORIAS)[number];

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  categoria: Categoria;
  ano: number;
  lido: boolean;
}

interface ResultadoValidacao {
  valido: boolean;
  erros: Partial<Record<"titulo" | "autor" | "categoria" | "ano", string>>;
}

const livros: Livro[] = [];
let proximoId: number = 1;

function obterElemento<T extends HTMLElement>(id: string): T {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }
  return elemento as T;
}

const formulario = obterElemento<HTMLFormElement>("form-livro");
const campoTitulo = obterElemento<HTMLInputElement>("titulo");
const campoAutor = obterElemento<HTMLInputElement>("autor");
const campoCategoria = obterElemento<HTMLSelectElement>("categoria");
const campoAno = obterElemento<HTMLInputElement>("ano");
const campoLido = obterElemento<HTMLInputElement>("lido");

const campoBusca = obterElemento<HTMLInputElement>("busca");
const filtroCategoria = obterElemento<HTMLSelectElement>("filtro-categoria");

const listaLivros = obterElemento<HTMLUListElement>("lista");
const mensagemVazio = obterElemento<HTMLParagraphElement>("mensagem-vazio");

const resumoTotal = obterElemento<HTMLSpanElement>("total");
const resumoLidos = obterElemento<HTMLSpanElement>("lidos");
const resumoNaoLidos = obterElemento<HTMLSpanElement>("nao-lidos");

// Validação //
function validarFormulario(
  titulo: string,
  autor: string,
  categoria: string,
  anoTexto: string,
): ResultadoValidacao {
  const erros: ResultadoValidacao["erros"] = {};
  const anoAtual: number = new Date().getFullYear();

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
    const ano: number = Number(anoTexto);
    if (Number.isNaN(ano) || !Number.isInteger(ano)) {
      erros.ano = "O ano deve ser um número inteiro.";
    } else if (ano < 1000 || ano > anoAtual) {
      erros.ano = `Informe um ano entre 1000 e ${anoAtual}.`;
    }
  }

  return { valido: Object.keys(erros).length === 0, erros };
}

function mostrarErros(erros: ResultadoValidacao["erros"]): void {
  const campos: Array<
    [
      "titulo" | "autor" | "categoria" | "ano",
      HTMLInputElement | HTMLSelectElement,
    ]
  > = [
    ["titulo", campoTitulo],
    ["autor", campoAutor],
    ["categoria", campoCategoria],
    ["ano", campoAno],
  ];

  for (const [nome, elemento] of campos) {
    const mensagem = erros[nome] ?? "";
    obterElemento<HTMLSpanElement>(`erro-${nome}`).textContent = mensagem;
    elemento.classList.toggle("invalido", mensagem !== "");
  }
}

// Função Catalgo//
function criarLivro(
  titulo: string,
  autor: string,
  categoria: Categoria,
  ano: number,
  lido: boolean,
): Livro {
  return {
    id: proximoId++,
    titulo: titulo.trim(),
    autor: autor.trim(),
    categoria,
    ano,
    lido,
  };
}

function adicionarLivro(livro: Livro): void {
  livros.push(livro);
}

function alternarEstado(id: number): void {
  const livro = livros.find((l: Livro) => l.id === id);
  if (livro !== undefined) {
    livro.lido = !livro.lido;
  }
}

function removerLivro(id: number): void {
  const indice = livros.findIndex((l: Livro) => l.id === id);
  if (indice !== -1) {
    livros.splice(indice, 1);
  }
}

// Retorna um novo array com os livros
function filtrarLivros(termo: string, categoria: string): Livro[] {
  const termoNormalizado = termo.trim().toLowerCase();
  return livros.filter((livro: Livro) => {
    const bateTitulo = livro.titulo.toLowerCase().includes(termoNormalizado);
    const bateCategoria = categoria === "" || livro.categoria === categoria;
    return bateTitulo && bateCategoria;
  });
}

function calcularResumo(): { total: number; lidos: number; naoLidos: number } {
  const lidos = livros.filter((l: Livro) => l.lido).length;
  return { total: livros.length, lidos, naoLidos: livros.length - lidos };
}

function ehCategoria(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}

function criarCard(livro: Livro): HTMLLIElement {
  const item = document.createElement("li");
  item.className = livro.lido ? "card lido" : "card";

  const titulo = document.createElement("h3");
  titulo.textContent = livro.titulo; // textContent evita injeção de HTML

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

function renderizarLista(): void {
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

function renderizarResumo(): void {
  const resumo = calcularResumo();
  resumoTotal.textContent = String(resumo.total);
  resumoLidos.textContent = String(resumo.lidos);
  resumoNaoLidos.textContent = String(resumo.naoLidos);
}

function atualizarTela(): void {
  renderizarLista();
  renderizarResumo();
}

formulario.addEventListener("submit", (evento: SubmitEvent) => {
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

atualizarTela();

# 📚 Catálogo de Livros

Aplicação web para organizar um catálogo de livros, desenvolvida com **HTML, CSS e TypeScript** para a disciplina \_Tópicos Especiais em Projeto e Desenvolvimento Web

# Professora

Ana Beatriz Moreira

## Autor

- Claudia Ferreira de Souza.

## Funcionalidades

- **Cadastrar livros** com título, categoria, autor, ano de publicação e estado (lido / não lido), com validação de campos obrigatórios.
- **Exibir o catálogo** em cards, com mensagens quando não há livros cadastrados ou quando a busca/filtro não encontra resultados.
- **Buscar** pelo título e **filtrar** por categoria.
- **Alterar o estado** (lido ↔ não lido) e **excluir** livros.
- **Resumo** com o total de livros e a quantidade de lidos e não lidos, atualizado a cada alteração.

## Tecnologias

- HTML5
- CSS3
- TypeScript (modo `strict`)
- Node.js + npm (para instalar o compilador do TypeScript)

## Como executar

git clone :
https://github.com/claudia-souza/TEPDW_avn1
cd catalogo-livros

2. **Instale as dependências** (instala o TypeScript):
   npm install
   npm run build
   npm start

**Abra no navegador**: <http://localhost:8080>

## Uso de TypeScript

- **Modelagem:** `interface Livro`, `interface ResultadoValidacao` e o tipo `Categoria`, gerado a partir da lista `CATEGORIAS`.
- **Array tipado:** `const livros: Livro[]` guarda o catálogo em memória.
- **Funções tipadas:** validação, criação, remoção, filtro, resumo e renderização, todas com parâmetros e retornos tipados, sem uso de `any`.
- **DOM e eventos:** a função genérica `obterElemento<T>` trata elementos nulos, e os eventos `submit`, `input` e `change` são tipados.

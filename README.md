# My Daily Goals

Prompt para Agente de IA — App de Gestão de Tarefas e Metas Pessoais

Construa um aplicativo web de gestão de tarefas e metas pessoais, com as seguintes especificações:

Stack Tecnológica

Linguagem: TypeScript (sem frameworks como React, Vue ou Angular — TypeScript puro/vanilla)

Estrutura: HTML5 semântico

Estilo: CSS3 (pode usar CSS Variables para temas, mas sem frameworks como Bootstrap ou Tailwind)

Ícones: todos os ícones da interface devem vir do site https://www.flaticon.com/br/ (baixe os SVGs/PNGs necessários e referencie localmente na pasta assets/icons, respeitando a licença de atribuição do Flaticon quando exigida)

Persistência de dados: localStorage do navegador (não é necessário backend/servidor)

Build: configurar um bundler simples (Vite ou esbuild) para compilar o TypeScript

Funcionalidades principais

1. Gestão de Tarefas

Criar, editar, concluir e excluir tarefas

Campos: título, descrição, data de vencimento, prioridade (baixa/média/alta), categoria/tag

Marcar como concluída com indicação visual clara (ícone de check do Flaticon)

Filtros: por status (pendente/concluída), por prioridade, por categoria, por data

Ordenação: por data de vencimento, prioridade ou ordem de criação

2. Gestão de Metas

Criar metas de curto, médio e longo prazo

Vincular tarefas a uma meta específica (subtarefas)

Barra de progresso visual mostrando % de conclusão da meta (calculado com base nas subtarefas concluídas)

Data alvo para conclusão da meta

Categorização de metas (ex: saúde, carreira, finanças, pessoal)

3. Dashboard / Visão Geral

Resumo do dia: tarefas pendentes, tarefas atrasadas, tarefas concluídas

Resumo de metas em andamento com progresso

Gráfico simples (pode ser feito em SVG/Canvas puro) de produtividade semanal

4. Interface e Experiência

Design limpo, responsivo (mobile-first) e acessível (uso correto de aria-labels, contraste adequado)

Modo claro/escuro

Ícones do Flaticon usados de forma consistente para: adicionar, editar, excluir, concluir, calendário, prioridade, categoria, metas, configurações

Animações leves de transição (CSS) ao concluir tarefas ou mudar de tela

Mensagens de estado vazio (ex: "Nenhuma tarefa por aqui ainda!") com ícone ilustrativo do Flaticon

Requisitos técnicos

Tipagem forte em TypeScript (interfaces para Task, Goal, Category, etc. — nada de any)

Organização do código em módulos (ex: models/, services/, components/, utils/)

Separação clara entre lógica de dados (CRUD no localStorage) e manipulação do DOM

Código comentado nos pontos-chave

Sem dependências externas de JS além do bundler e, se necessário, uma lib leve para ícones/SVG

Entregáveis esperados

Estrutura de pastas do projeto

Código-fonte completo (HTML, CSS, TypeScript)

Instruções de instalação e execução (README.md)

Lista dos ícones do Flaticon utilizados, com link de origem de cada um

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e33cd230-fc00-420c-b5bf-126ade2184b0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

# Boas Práticas — Uso do Claude Code na Dressy

Guia de referência sobre como trabalhar com o Claude Code de forma eficiente no projeto.

---

## 1. Estrutura de Arquivos de Contexto

O Claude Code carrega arquivos de contexto automaticamente no início de cada sessão.
Mantenha-os atualizados sempre que a stack ou os padrões do projeto mudarem.

```
dressy/
├── CLAUDE.md          ← instruções específicas para o Claude Code
├── AGENTS.md          ← fonte de verdade universal (lido por qualquer agente)
└── .claude/
    ├── agents/        ← subagentes especializados
    └── skills/        ← skills do projeto
```

### AGENTS.md — o que deve ter

- Visão geral do produto
- Stack completa com versões
- Estrutura de pastas do projeto
- Perfis de usuário (customer / merchant)
- Padrões de código e convenções de nomenclatura
- Comandos úteis (`npm run dev`, `npm run build`, etc.)

### CLAUDE.md — o que deve ter

- `@AGENTS.md` no topo (importa o conteúdo do AGENTS.md)
- Contexto acadêmico (disciplina, time, semestre)
- Instruções específicas de como trabalhar no projeto
- Lista das skills disponíveis com quando usá-las
- O que **não** fazer (ex: não criar API routes para o que pode ser Server Action)

> **Regra:** CLAUDE.md e AGENTS.md são a "constituição" do projeto.
> Instruções no prompt são temporárias. Instruções nesses arquivos são permanentes.

---

## 2. Escrevendo Bons Prompts

A diferença entre um prompt ruim e um bom prompt é **contexto + escopo + resultado esperado**.

### ❌ Ruim

```
"cria o cadastro de produto"
```

### ✅ Bom

```
"em app/(store)/produtos/novo/page.tsx, cria o formulário de cadastro
de produto com os campos: nome, descrição, preço, estoque e categoria.
Use Server Action para salvar no Supabase na tabela products"
```

### Fórmula para prompts eficientes

| Elemento            | Exemplo                                          |
| ------------------- | ------------------------------------------------ |
| **Onde**            | `em app/(store)/produtos/novo/page.tsx`          |
| **O que**           | `cria o formulário de cadastro de produto`       |
| **Campos/detalhes** | `com os campos: nome, descrição, preço, estoque` |
| **Como**            | `Use Server Action para salvar no Supabase`      |
| **Tabela/entidade** | `na tabela products`                             |

---

## 3. Modo de Planejamento

Antes de implementar qualquer feature de média ou grande complexidade,
use o modo de planejamento para revisar o que o Claude pretende fazer
**antes** de ele escrever qualquer código.

```bash
# No terminal do Claude Code
> plan: implementar o módulo de closet virtual completo
```

O Claude vai listar todos os arquivos que pretende criar ou modificar.
**Revise o plano antes de confirmar.** Isso evita retrabalho.

Use planejamento quando:

- A feature envolve mais de 3 arquivos
- Há criação de nova tabela no banco
- O fluxo envolve autenticação ou autorização
- Você não tem certeza do escopo

---

## 4. Skills Disponíveis no Projeto

Skills são playbooks especializados que o Claude carrega sob demanda.
Invoque explicitamente com `/nome-da-skill` ou deixe o Claude detectar automaticamente.

| Skill                | Quando usar                                      | Comando               |
| -------------------- | ------------------------------------------------ | --------------------- |
| `new-feature`        | Criar feature completa (página + action + tipos) | `/new-feature`        |
| `supabase-migration` | Criar ou alterar tabelas no banco                | `/supabase-migration` |
| `new-component`      | Criar componente React reutilizável              | `/new-component`      |
| `pr-review`          | Revisar código antes de merge                    | `/pr-review`          |

### Dica de invocação

```bash
# Seja descritivo ao invocar uma skill
/new-feature implementar página de listagem de produtos com filtro por categoria

/supabase-migration criar tabela de favoritos com RLS para o closet virtual

/pr-review revisa os arquivos alterados nessa sessão antes do commit
```

> **Limitação conhecida:** o Claude nem sempre invoca skills automaticamente.
> Se o comportamento esperado não ocorrer, invoque explicitamente com `/`.

---

## 5. Subagentes Especializados

Use `@nome-do-agente` para delegar tarefas específicas a agentes com
contexto especializado.

```bash
# Antes de rodar uma migration no Supabase
@db-reviewer analisa essa migration antes de eu executar

# Antes de abrir um PR
@code-reviewer revisa o arquivo lib/auth/actions.ts
```

| Agente          | Especialidade                                                  |
| --------------- | -------------------------------------------------------------- |
| `db-reviewer`   | Queries SQL, RLS, índices, relacionamentos                     |
| `code-reviewer` | Padrões Next.js, tipagem, segurança, Supabase client vs server |

---

## 6. Comandos Úteis do Claude Code

```bash
# Ver o contexto que o Claude carregou na sessão atual
/memory show

# Forçar recarga após atualizar o CLAUDE.md
/memory refresh

# Inicializar memória do projeto (rode uma vez ao clonar)
/init

# Compactar o contexto quando a sessão estiver longa
/compact
```

---

## 7. O Que Nunca Fazer

- **Nunca hardcode** chaves de API, secrets ou senhas em nenhum arquivo
- **Nunca use `any`** no TypeScript — peça ao Claude para tipar corretamente
- **Nunca acesse o Supabase** diretamente em Client Components (`'use client'`)
- **Nunca crie API Routes** (`app/api/`) para operações que podem ser Server Actions
- **Nunca instale bibliotecas** sem revisar o que o Claude está adicionando
- **Nunca commite** o `.env.local`

---

## 8. Fluxo Recomendado para Novas Features

```
1. /plan → revisar escopo e arquivos antes de qualquer código
2. /supabase-migration → criar tabela se necessário, revisar com @db-reviewer
3. /new-feature → implementar a feature seguindo os padrões da Dressy
4. /pr-review → revisar antes do commit com @code-reviewer
5. commit → mensagem em Conventional Commits (feat:, fix:, chore:, refactor:)
```

---

## 9. Conventional Commits

Todo commit deve seguir o padrão:

```
feat: adiciona cadastro de produto com upload de imagem
fix: corrige validação de estoque no carrinho
chore: atualiza dependências do supabase-js
refactor: extrai lógica de autenticação para lib/auth
```

| Tipo       | Quando usar                                |
| ---------- | ------------------------------------------ |
| `feat`     | Nova funcionalidade                        |
| `fix`      | Correção de bug                            |
| `chore`    | Configuração, dependências, setup          |
| `refactor` | Melhoria de código sem mudar comportamento |
| `docs`     | Documentação                               |

---

## 10. Gestão de Contexto em Sessões Longas

O Claude perde qualidade de resposta quando o contexto fica muito longo.

- Use `/compact` quando a sessão estiver longa e você for continuar
- Prefira **sessões focadas** (uma feature por sessão) a sessões longas com múltiplos assuntos
- Se travar em algo por mais de 2 tentativas, inicie uma nova sessão e descreva o problema do zero com contexto limpo

---

_Mantenha este arquivo atualizado conforme o projeto evoluir._

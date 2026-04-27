# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Contexto Acadêmico

Este projeto é o MVP da disciplina de Engenharia de Software.
O time é composto por Felipe e Jean.

## Comandos

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # build de produção
npm run lint     # ESLint
```

Não há testes automatizados configurados ainda.

## Arquitetura

Stack: **Next.js 16** (App Router) + **Supabase** + **shadcn/ui** + **Tailwind CSS v4**.

```
app/             # rotas e layouts (Next.js App Router)
components/
  ui/            # componentes shadcn/ui (sem lógica de negócio)
  shared/        # componentes com lógica de negócio
lib/
  supabase/
    server.ts    # createClient() para Server Components e Actions
    client.ts    # createClient() para Client Components (uso restrito)
  utils.ts       # cn() helper para classnames
types/           # tipos TypeScript por entidade de domínio
```

O `lib/supabase/server.ts` usa `@supabase/ssr` com cookies do Next.js — é async (`await createClient()`). O `lib/supabase/client.ts` usa `createBrowserClient` e deve ser usado excepcionalmente.

## Como Trabalhar Neste Projeto

### Antes de implementar qualquer feature

1. Leia o guia relevante em `node_modules/next/dist/docs/` — esta versão do Next.js tem breaking changes
2. Verifique se existe um tipo TypeScript em `types/` para a entidade
3. Confirme se a tabela correspondente existe no Supabase antes de escrever queries

### Supabase

- Nunca acesse o Supabase diretamente de Client Components
- Sempre use `createClient()` de `lib/supabase/server.ts` em Server Components e Actions
- Row Level Security (RLS) está ativo — leve isso em conta ao escrever políticas

### Ao criar novos componentes

- Verifique se já existe um componente shadcn/ui adequado antes de criar do zero
- Decida o escopo pelo número de consumidores reais (não promova por especulação):

  | Escopo                                              | Pasta                       |
  | --------------------------------------------------- | --------------------------- |
  | Usado por **1 rota**                                | `app/<rota>/_components/`   |
  | Usado por **2+ rotas do mesmo route group**         | `app/<group>/_components/`  |
  | UI pura usada em **2+ route groups**                | `components/ui/`            |
  | Com lógica de negócio em **2+ route groups**        | `components/shared/`        |

- Subcomponentes só usados por uma página **não** ficam no fim do mesmo arquivo — extraia para `_components/` da rota desde o início (pasta privada, ignorada pelo router).
- Promova um nível acima quando aparecer o segundo consumidor — antes disso é abstração prematura.
- Arquivos em kebab-case, exports nomeados em PascalCase.
- Imports sempre via alias `@/` — nunca caminhos relativos (`./` ou `../`). Exceção única: barrels (`index.ts`) re-exportando irmãos da própria pasta.

### Ao criar Server Actions

- Arquivo sempre começa com `'use server'`
- Validar inputs antes de qualquer operação no banco
- Retornar `{ error: string }` em caso de falha, nunca lançar exceção sem tratar

## Skills Disponíveis

As skills abaixo estão em `.claude/skills/` e podem ser acionadas quando o contexto da tarefa corresponder:

- **agent-development** — criação e estruturação de subagents para Claude Code (frontmatter, system prompt, ferramentas, cores, exemplos)
- **skill-development** — criação de novas skills (estrutura, progressive disclosure, boas práticas de descrição)
- **plugin-structure** — scaffold e organização de plugins do Claude Code (`plugin.json`, `${CLAUDE_PLUGIN_ROOT}`, auto-discovery)
- **plugin-settings** — configuração persistente de plugin via `.claude/plugin-name.local.md` (frontmatter YAML + markdown)
- **frontend-design** — construção de componentes/páginas frontend com acabamento visual diferenciado, evitando estética genérica de IA
- **claude-opus-4-5-migration** — migração de prompts e código de Sonnet 4.0/4.5 ou Opus 4.1 para Opus 4.5

## O Que NÃO Fazer

- Não instalar bibliotecas sem mencionar — confirme comigo antes
- Não criar API Routes (`app/api/`) para operações que podem ser Server Actions
- Não commitar `.env.local`

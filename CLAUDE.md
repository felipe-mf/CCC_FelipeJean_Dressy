# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Contexto Acadêmico

Este projeto é o MVP da disciplina de Engenharia de Software da UPF (2025/2).
O time é composto por Felipe, Jean, Lucas e Manuela.

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
- Componentes de UI pura vão em `components/ui/`
- Componentes com lógica de negócio vão em `components/shared/`

### Ao criar Server Actions

- Arquivo sempre começa com `'use server'`
- Validar inputs antes de qualquer operação no banco
- Retornar `{ error: string }` em caso de falha, nunca lançar exceção sem tratar

## O Que NÃO Fazer

- Não instalar bibliotecas sem mencionar — confirme comigo antes
- Não criar API Routes (`app/api/`) para operações que podem ser Server Actions
- Não commitar `.env.local`

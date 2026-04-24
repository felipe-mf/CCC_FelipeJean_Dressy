---
name: Dressy project context
description: Stack, convenções e regras de arquitetura do projeto Dressy (MVP académico)
type: project
---

Stack: Next.js 16 App Router + Supabase (@supabase/ssr) + shadcn/ui + Tailwind CSS v4.

Membros: Felipe e Jean (disciplina de Engenharia de Software).

Regras críticas documentadas em CLAUDE.md:
- Server Actions sempre com 'use server', validar inputs antes de qualquer operação no banco
- Retornar { error: string } em caso de falha, nunca lançar exceção sem tratar
- Nunca acessar Supabase de Client Components
- lib/supabase/server.ts: createClient() async, para Server Components e Actions
- lib/supabase/client.ts: createBrowserClient, uso excepcional
- RLS ativo no Supabase — levar em conta ao escrever políticas
- Não criar API Routes para operações que podem ser Server Actions

**Why:** Projeto académico com regras explícitas de arquitetura para manter consistência e segurança.
**How to apply:** Toda revisão de código deve verificar aderência a essas regras antes de qualquer outra análise.

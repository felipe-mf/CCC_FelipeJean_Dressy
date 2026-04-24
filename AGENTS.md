<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# Dressy — Agente de Contexto do Projeto

## O que é a Dressy

Marketplace de moda circular que conecta brechós, lojas locais e vendedores
independentes a consumidores urbanos interessados em consumo consciente e
descoberta de estilo pessoal. Funciona como um "Enjoei com IA": recomendações
personalizadas de estilo geradas pela Anthropic API, closet virtual, e suporte
completo a compra e venda sustentável.

O diferencial está na personalização: ao se cadastrar, o usuário responde a um
questionário de perfil de estilo e pode enviar fotos do guarda-roupa para que a
plataforma identifique suas preferências e gere recomendações automáticas.

**Público-alvo:** homens e mulheres a partir de 18 anos que enfrentam compras impulsivas,
guarda-roupas desorganizados e dificuldade em identificar o próprio estilo.

## Perfis de Usuário

- `customer` — compradora: acessa catálogo, closet virtual, pedidos, recomendações de IA
- `merchant` — lojista: acessa painel gerencial com gestão de loja, produtos, e estatísticas

---

## Stack

| Camada             | Tecnologia                | Versão |
| ------------------ | ------------------------- | ------ |
| Frontend + BFF     | Next.js (App Router)      | 16.x   |
| Linguagem          | TypeScript                | 6.x    |
| Estilização        | Tailwind CSS              | 4.x    |
| Componentes        | shadcn/ui                 | latest |
| Auth               | Supabase Auth             | —      |
| Banco de dados     | PostgreSQL via Supabase   | 17     |
| Storage            | Supabase Storage          | —      |
| Pagamentos         | Stripe + AbacatePay (Pix) | —      |
| IA de estilo       | Anthropic API (Claude)    | —      |
| CI/CD + Hospedagem | Vercel                    | —      |

---

## Estrutura de Pastas

```
app/
├── (auth)/             # Cadastro, login — layout minimalista sem navbar
├── (store)/            # Painel do lojista — layout com sidebar
└── (customer)/         # Catálogo, closet, pedidos — layout com navbar e footer
lib/
├── supabase/
│   ├── client.ts       # Supabase browser client (Client Components)
│   └── server.ts       # Supabase server client (Server Components + Actions)
├── auth/
│   └── actions.ts      # Server Actions de autenticação
types/                  # Interfaces TypeScript do domínio
components/
├── ui/                 # shadcn/ui e componentes puramente visuais
└── shared/             # Componentes com lógica de negócio reutilizável
```

---

## Padrões de Código

- **Mutações** sempre via Server Actions — nunca API Routes para operações de formulário
- **Supabase server** (`lib/supabase/server.ts`) → exclusivo para Server Components e Actions
- **Supabase client** (`lib/supabase/client.ts`) → exclusivo para Client Components
- **`'use client'`** apenas quando há estado local, eventos DOM ou hooks
- **Sem `any`** no TypeScript — tipar todas as props e retornos explicitamente
- **Sem secrets hardcoded** — usar sempre variáveis de ambiente
- **Commits** no padrão Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- **Arquivos** em kebab-case, **componentes** em PascalCase

### Padrão de Server Action

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function nomeDaAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // validar → operar → revalidar
  revalidatePath("/rota-afetada");
}
```

---

## Banco de Dados — Entidades Principais

```
USER / profiles ──< ADDRESS
USER ──1 CART ──< CART_ITEM >── PRODUCT
USER ──1 CLOSET ──< CLOSET_ITEM >── PRODUCT (nullable)
USER ──< ORDER ──< ORDER_ITEM >── PRODUCT
USER ──< REVIEW >── PRODUCT
USER (merchant) ──1 STORE ──< PRODUCT ──< PRODUCT_IMAGE
PRODUCT >──< CATEGORY (via PRODUCT_CATEGORY)
```

**Regras de banco:**

- Toda tabela nova deve ter `ENABLE ROW LEVEL SECURITY`
- Toda tabela nova deve ter policies para SELECT, INSERT, UPDATE e DELETE
- FKs sempre com `ON DELETE CASCADE` ou `RESTRICT` consciente
- Índices em colunas usadas em `WHERE` e `JOIN` frequentes

---

## Diretrizes de Design

### Identidade Visual

A Dressy tem uma estética **warm fashion** — acolhedora, sofisticada e sustentável.
O design deve remeter a brechós curados, moda consciente e um guarda-roupa bem organizado.
Evitar o visual frio e minimalista típico de e-commerces genéricos.

### Paleta de Cores

```
/* Fundo principal */
--color-background:     #F5F0E8   /* bege quente — base de todas as telas */
--color-surface:        #FDFAF4   /* bege mais claro — cards, modais */
--color-surface-alt:    #EDE8DC   /* bege escuro — hover, separadores */

/* Primária */
--color-primary:        #C2622A   /* laranja queimado — CTAs, botões principais */
--color-primary-hover:  #A84E1F   /* laranja escuro — hover do primário */
--color-primary-light:  #F0D5C0   /* laranja claro — badges, destaques suaves */

/* Secundária */
--color-secondary:      #6B3E26   /* marrom — textos de destaque, títulos */
--color-secondary-light:#9C6644   /* marrom médio — ícones, labels */

/* Texto */
--color-text-primary:   #2C1A0E   /* marrom quase preto — corpo de texto */
--color-text-secondary: #7A5C44   /* marrom suave — subtítulos, metadados */
--color-text-muted:     #B09880   /* bege escuro — placeholders, disabled */

/* Estados */
--color-success:        #5C8A4E   /* verde musgo — confirmações */
--color-error:          #B94040   /* vermelho terroso — erros */
--color-warning:        #C89030   /* âmbar — alertas */

/* Bordas */
--color-border:         #D9CFC0   /* bege médio — bordas de inputs e cards */
```

### Tipografia

Usar fontes que remetem à moda editorial sem perder legibilidade digital.

```
/* Títulos e headings — serif elegante */
font-family: 'Playfair Display', Georgia, serif;

/* Corpo e UI — sans-serif limpa e moderna */
font-family: 'DM Sans', 'Inter', system-ui, sans-serif;

/* Labels e tags — tracking generoso */
font-family: 'DM Sans', sans-serif;
letter-spacing: 0.05em;
text-transform: uppercase;
```

Escala tipográfica:

```
h1: 2.5rem / font-weight: 700 / Playfair Display
h2: 2rem   / font-weight: 600 / Playfair Display
h3: 1.5rem / font-weight: 600 / DM Sans
h4: 1.25rem/ font-weight: 500 / DM Sans
body: 1rem / font-weight: 400 / DM Sans
small: 0.875rem / DM Sans
label: 0.75rem / DM Sans / uppercase / tracking-wide
```

Para carregar as fontes no Next.js (`app/layout.tsx`):

```ts
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
```

### Componentes e Estilo

- **Bordas:** `border-radius` generoso — `rounded-2xl` para cards, `rounded-xl` para inputs e botões
- **Sombras:** suaves e quentes — `shadow-sm` com `shadow-amber-100/50`, nunca sombras frias
- **Espaçamento:** generoso — preferir `padding` e `gap` maiores para respiração visual
- **Imagens de produto:** sempre em aspect ratio `3/4` (retrato) — padrão fashion
- **Hover states:** transição suave `transition-all duration-200`
- **Botão primário:** fundo `--color-primary`, texto branco, sem bordas, `rounded-xl`
- **Botão secundário:** fundo transparente, borda `--color-border`, texto `--color-secondary`
- **Inputs:** fundo `--color-surface`, borda `--color-border`, focus com borda `--color-primary`

### Tom Visual Geral

- Preferir layouts **assimétricos e editoriais** a grids perfeitamente uniformes
- Usar **espaço negativo** generoso — não encher a tela
- Fotografias de produto com **fundo neutro bege ou branco**
- Ícones no estilo **line icons** (outline), não filled
- Evitar gradientes artificiais — se usar, apenas entre tons próximos da paleta
- Layout web first: md e lg

---

## Comandos Úteis

```bash
npm run dev        # inicia servidor de desenvolvimento
npm run build      # build de produção
npm run lint       # ESLint
```

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

Nunca hardcode valores dessas variáveis. Nunca commite `.env.local`.

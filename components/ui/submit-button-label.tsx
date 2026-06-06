import { Spinner } from "@/components/ui/spinner"

/**
 * Conteúdo de um botão de submit que mostra um spinner ao lado do texto
 * enquanto a ação está pendente. Centraliza o padrão usado nos formulários.
 */
function SubmitButtonLabel({
  pending,
  children,
}: {
  pending: boolean
  children: React.ReactNode
}) {
  return (
    <span className="flex items-center gap-3">
      {pending && <Spinner className="size-5" />}
      {children}
    </span>
  )
}

/**
 * Classes de cor/estado para botões de submit primários (fundo `bg-primary`).
 *
 * - Processando (`pending`): cor mais escura + cursor de espera, em opacidade
 *   cheia — deixa claro que está carregando, sem parecer apenas "apagado".
 * - Bloqueado por falta de dado (botão `disabled` mas não pendente): esmaecido
 *   com cursor de bloqueio.
 */
function submitButtonState(pending: boolean) {
  return pending
    ? "bg-[#A84E1F] text-primary-foreground cursor-wait transition-colors"
    : "bg-primary text-primary-foreground transition-colors hover:bg-[#A84E1F] disabled:opacity-50 disabled:cursor-not-allowed"
}

export { SubmitButtonLabel, submitButtonState }

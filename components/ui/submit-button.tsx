import { cn } from "@/lib/utils"
import {
  SubmitButtonLabel,
  submitButtonState,
} from "@/components/ui/submit-button-label"

/**
 * Botão de submit primário com feedback de carregamento embutido: quando
 * `pending` é true ele mostra o spinner ao lado do texto, troca para a cor de
 * "processando" e desabilita o clique — tudo num só lugar, para os chamadores
 * não precisarem fiar `disabled`, cor e spinner separadamente (e acabarem
 * inconsistentes).
 *
 * `className` ajusta layout/tamanho; `trailing` adiciona conteúdo após o texto
 * (ex.: a seta →). `disabled` extra é combinado com o estado pendente.
 */
function SubmitButton({
  pending,
  disabled,
  className,
  trailing,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  pending: boolean
  trailing?: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cn("group font-heading", submitButtonState(pending), className)}
      {...props}
    >
      <SubmitButtonLabel pending={pending}>{children}</SubmitButtonLabel>
      {trailing}
    </button>
  )
}

export { SubmitButton }

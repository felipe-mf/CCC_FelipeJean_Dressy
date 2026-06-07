import Image from "next/image";

import { storeImageUrl } from "@/lib/store/image-url";
import type { Store } from "@/types";

// Mostra o logo da loja quando houver; senão, as iniciais do nome. O caller
// controla tamanho/estilo via className (caixa) e textClassName (iniciais);
// `px` é o tamanho intrínseco da imagem para o next/image.
export function StoreAvatar({
  store,
  px,
  className,
  textClassName,
}: {
  store: Store | null;
  px: number;
  className?: string;
  textClassName?: string;
}) {
  const initials = store
    ? store.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "D";

  return (
    <div className={className}>
      {store?.logo_url ? (
        <Image
          src={storeImageUrl(store.logo_url)}
          alt=""
          width={px}
          height={px}
          className="size-full object-cover"
        />
      ) : (
        <span className={textClassName}>{initials}</span>
      )}
    </div>
  );
}

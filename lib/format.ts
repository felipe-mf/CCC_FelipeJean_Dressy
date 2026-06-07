// Formatadores compartilhados. Instanciar `Intl.*Format` é custoso, então
// criamos uma vez por formato e reutilizamos via funções puras (seguras em
// Server e Client Components).

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

const dateShort = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string | Date): string {
  return dateShort.format(typeof value === "string" ? new Date(value) : value);
}

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string | Date): string {
  return dateTime.format(typeof value === "string" ? new Date(value) : value);
}

// Endereço em duas linhas para exibição. `line1` é logradouro + número (+
// complemento); `line2` é bairro, cidade/UF e CEP. As telas decidem se as
// renderizam empilhadas ou unidas por " · ".
type FormattableAddress = {
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  postal_code: string;
};

export function formatAddressLines(addr: FormattableAddress): {
  line1: string;
  line2: string;
} {
  return {
    line1: `${addr.street}, ${addr.number}${
      addr.complement ? ` — ${addr.complement}` : ""
    }`,
    line2: `${addr.district}, ${addr.city}/${addr.state} · ${addr.postal_code}`,
  };
}

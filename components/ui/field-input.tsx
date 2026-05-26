export function FieldInput({
  label,
  name,
  type,
  autoComplete,
  required,
  index,
  minLength,
  maxLength,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  index: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <label className="group flex flex-col gap-2">
      <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
        <span>{label}</span>
        <span className="text-primary font-heading not-italic">{index}</span>
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        defaultValue={defaultValue}
        className="w-full bg-transparent border-0 border-b border-border py-3 font-heading text-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
      />
      {hint && (
        <span className="text-xs text-muted-foreground italic font-heading">
          {hint}
        </span>
      )}
    </label>
  );
}

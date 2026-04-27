export function RoleTile({
  value,
  roman,
  title,
  body,
  defaultChecked,
}: {
  value: string;
  roman: string;
  title: string;
  body: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="relative cursor-pointer group">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <div className="h-full flex flex-col gap-2 border border-border p-5 bg-card transition-all group-has-[:checked]:border-primary group-has-[:checked]:bg-accent/60 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
        <div className="flex items-center justify-between">
          <span className="font-heading italic text-primary">{roman}</span>
          <span className="size-3 rounded-full border border-border group-has-[:checked]:bg-primary group-has-[:checked]:border-primary transition-colors" />
        </div>
        <span className="font-heading text-xl text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">
          {body}
        </span>
      </div>
    </label>
  );
}

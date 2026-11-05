type FilterOption = { value: string; label: string };

type FilterConfig = {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  shown?: number;
  total?: number;
};

export function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  filters = [],
  shown,
  total,
}: Props) {
  const field = "rounded-lg border border-border px-3 py-2 text-sm";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex min-w-[200px] flex-1 flex-col gap-3 sm:max-w-md">
        <label className="text-sm font-medium text-ink">
          Busca
          <input
            type="search"
            className={`${field} mt-1 w-full`}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>
      {filters.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {filters.map((f) => (
            <label key={f.id} className="text-sm font-medium text-ink">
              {f.label}
              <select className={`${field} mt-1 block min-w-[140px]`} value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
      {shown !== undefined && total !== undefined ? (
        <p className="text-sm text-muted sm:pb-2">
          Exibindo {shown} de {total}
        </p>
      ) : null}
    </div>
  );
}

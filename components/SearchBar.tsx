type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Sok i tittel, kallenavn eller tekst"
        className="w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-indigo-600 transition focus:ring-2 dark:bg-slate-900 dark:text-slate-50"
      />
    </div>
  );
}

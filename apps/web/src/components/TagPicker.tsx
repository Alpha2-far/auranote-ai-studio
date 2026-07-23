import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createTag } from '../db/db';
import { cx } from '../lib/config';

const PALETTE = ['#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ec4899', '#14b8a6', '#ef4444'];

export function TagPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const tags = useLiveQuery(() => db.tags.toArray(), [], []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);

  const add = async () => {
    if (!name.trim()) return;
    const color = PALETTE[tags.length % PALETTE.length];
    const tag = await createTag(name.trim(), color);
    onChange([...selected, tag.id]);
    setName('');
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags
          .filter((t) => selected.includes(t.id))
          .map((t) => (
            <span
              key={t.id}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: `${t.color}22`, color: t.color }}
            >
              {t.name}
              <button onClick={() => toggle(t.id)} className="opacity-60 hover:opacity-100">
                ×
              </button>
            </span>
          ))}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-dashed border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-soft)] hover:border-brand-500"
        >
          + Tag
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
          <div className="max-h-52 overflow-y-auto">
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={cx(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition',
                  selected.includes(t.id) ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5',
                )}
              >
                <span className="size-3 rounded-full" style={{ background: t.color }} />
                <span className="flex-1 truncate">{t.name}</span>
                {selected.includes(t.id) && <span className="text-brand-600">✓</span>}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1 border-t border-[var(--border)] pt-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="Nouveau tag…"
              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm outline-none focus:border-brand-500"
            />
            <button onClick={add} className="rounded-lg bg-brand-500 px-2 py-1 text-sm font-semibold text-[#0D0F12]">
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

// One tap for the common colours, with a text box for anything else
// ("camo", "red and white"). Tapping fills the box, so there is one value.

const COLOURS: [name: string, hex: string][] = [
  ['Red', '#d92d20'],
  ['Orange', '#f27b18'],
  ['Yellow', '#f5c518'],
  ['Green', '#2e9e4f'],
  ['Teal', '#14a3a3'],
  ['Blue', '#2b7fd4'],
  ['Navy', '#1b2f5b'],
  ['Purple', '#7b3fb5'],
  ['Pink', '#ec5fa4'],
  ['White', '#ffffff'],
  ['Grey', '#8a939c'],
  ['Black', '#16181b'],
];

export function ColourPicker({
  id,
  label,
  value,
  onChange,
  testId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  const current = value.trim().toLowerCase();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="swatches" role="group" aria-label={label}>
        {COLOURS.map(([name, hex]) => (
          <button
            key={name}
            type="button"
            className="swatch"
            aria-pressed={current === name.toLowerCase()}
            onClick={() => onChange(name)}
            data-testid={`${testId}-${name.toLowerCase()}`}
          >
            <span className="swatch-dot" style={{ background: hex }} aria-hidden="true" />
            {name}
          </button>
        ))}
      </div>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Or type a colour" data-testid={testId} />
    </div>
  );
}

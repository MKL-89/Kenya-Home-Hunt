import { useId, useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { searchPlaces, type PlaceMatch } from "@/lib/kenya-locations";
import { cn } from "@/lib/utils";

interface PlaceSearchProps {
  value: PlaceMatch | null;
  onChange: (place: PlaceMatch | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Type-ahead for any county, town or estate in Kenya.
 * "eldo" → "Eldoret, Uasin Gishu", so people don't need to know the county.
 */
export function PlaceSearch({ value, onChange, placeholder = "Town, estate or county", className, inputClassName }: PlaceSearchProps) {
  const [text, setText] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const blurTimer = useRef<number | undefined>(undefined);

  const matches = useMemo(() => (open ? searchPlaces(text) : []), [text, open]);

  const choose = (m: PlaceMatch) => {
    onChange(m);
    setText(m.label);
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setText("");
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // let a click on a suggestion land first
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (!matches.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && open) { e.preventDefault(); choose(matches[active]); }
          else if (e.key === "Escape") setOpen(false);
        }}
        className={cn(
          "w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
          inputClassName,
        )}
      />
      {text && (
        <button type="button" onClick={clear} aria-label="Clear location"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
      {open && matches.length > 0 && (
        <ul id={listId} role="listbox"
          className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg py-1">
          {matches.map((m, i) => (
            <li key={m.label} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); window.clearTimeout(blurTimer.current); choose(m); }}
              onMouseEnter={() => setActive(i)}
              className={cn("px-3 py-2 text-sm cursor-pointer flex items-center gap-2", i === active && "bg-muted")}>
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{m.label}</span>
            </li>
          ))}
        </ul>
      )}
      {open && text.trim().length >= 2 && matches.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg">
          No town found. Try the county name.
        </div>
      )}
    </div>
  );
}

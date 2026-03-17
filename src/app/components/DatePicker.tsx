import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const WEEKDAY_MAP = ["日", "一", "二", "三", "四", "五", "六"];

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayDate = format(value, "yyyy / MM / dd");
  const displayWeekday = `週${WEEKDAY_MAP[value.getDay()]}`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1.5">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-[#64748b] hover:text-[#1a2236] transition-colors group"
        style={{ fontSize: "0.88rem" }}
      >
        <Calendar size={12} className="text-[#94a3b8] group-hover:text-[#1a2236] transition-colors" />
        <span>{displayDate}</span>
        <span
          className="px-1.5 py-0.5 rounded bg-[#0f1f3d] text-white ml-1 select-none"
          style={{ fontSize: "0.78rem" }}
        >
          {displayWeekday}
        </span>
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl border border-[#e4e8f0] shadow-xl overflow-hidden"
          style={{ minWidth: "280px" }}
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (d) {
                onChange(d);
                setOpen(false);
              }
            }}
            locale={zhTW}
            showOutsideDays
            components={{
              IconLeft: () => <ChevronLeft size={14} />,
              IconRight: () => <ChevronRight size={14} />,
            }}
            styles={{
              root: { margin: 0, padding: "12px 16px 16px" },
              caption: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                paddingBottom: "8px",
                borderBottom: "1px solid #e4e8f0",
              },
              caption_label: {
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#0f1f3d",
                letterSpacing: "0.04em",
              },
              nav: { display: "flex", gap: "4px" },
              nav_button: {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "26px",
                height: "26px",
                borderRadius: "6px",
                border: "1px solid #e4e8f0",
                background: "white",
                cursor: "pointer",
                color: "#64748b",
              },
              head_cell: {
                fontSize: "0.72rem",
                color: "#94a3b8",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textAlign: "center",
                paddingBottom: "6px",
              },
              cell: { padding: "1px" },
              day: {
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                color: "#1a2236",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
              day_selected: {
                backgroundColor: "#0f1f3d",
                color: "white",
                borderRadius: "8px",
              },
              day_today: {
                fontWeight: 700,
                color: "#2563eb",
              },
              day_outside: { color: "#c8d0dc" },
            }}
          />
        </div>
      )}
    </div>
  );
}

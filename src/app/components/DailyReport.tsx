import { useState, useEffect } from "react"; // 1. 引入 useEffect 用於監控變動
import { Plus, Trash2, ChevronDown, Calendar, User, Building2, Printer } from "lucide-react";
import { DatePicker } from "./DatePicker";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SupervisorItem {
  id: string;
  index: number;
  project: string;
  content: string;
  owner: string;
}

interface WorkItem {
  id: string;
  project: string;
  progress: string;
  status: "in-progress" | "upcoming";
}

interface PlatformData {
  inProgress: WorkItem[];
  upcoming: WorkItem[];
}

type Platform = "frontend" | "middle" | "backend";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const today = () => {
  return "2026 / 03 / 18";
};

const weekday = () => {
  return "週三";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EditableCell({
  value,
  onChange,
  placeholder,
  className = "",
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`w-full bg-transparent resize-none outline-none placeholder-[#b0b8c8] text-[#1a2236] ${className}`}
        style={{ fontSize: "0.93rem", lineHeight: "1.6" }}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none placeholder-[#b0b8c8] text-[#1a2236] ${className}`}
      style={{ fontSize: "0.93rem" }}
    />
  );
}

function SupervisorRow({
  item,
  onUpdate,
  onDelete,
  isLast,
}: {
  item: SupervisorItem;
  onUpdate: (field: keyof SupervisorItem, value: string | number) => void;
  onDelete: () => void;
  isLast: boolean;
}) {
  return (
    <tr className="group border-b border-[#e8ecf2] hover:bg-[#f7f9fc] transition-colors">
      <td className="py-3 px-4 text-center w-12">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0f1f3d] text-white"
          style={{ fontSize: "0.72rem" }}
        >
          {item.index}
        </span>
      </td>
      <td className="py-3 px-4 w-40">
        <EditableCell
          value={item.project}
          onChange={(v) => onUpdate("project", v)}
          placeholder="專案 / 需求名稱"
        />
      </td>
      <td className="py-3 px-4">
        <EditableCell
          value={item.content}
          onChange={(v) => onUpdate("content", v)}
          placeholder="說明報告重點…"
          multiline
        />
      </td>
      <td className="py-3 px-4 w-32">
        <EditableCell
          value={item.owner}
          onChange={(v) => onUpdate("owner", v)}
          placeholder="窗口姓名"
        />
      </td>
      <td className="py-2 px-2 w-10 text-right">
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#b0b8c8] hover:text-[#e05252]"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

const PLATFORM_META: Record<Platform, { label: string; short: string; accent: string; bg: string; dot: string }> = {
  frontend: {
    label: "前台",
    short: "F",
    accent: "#2563eb",
    bg: "#eff6ff",
    dot: "#2563eb",
  },
  middle: {
    label: "中台",
    short: "M",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    dot: "#7c3aed",
  },
  backend: {
    label: "後台",
    short: "B",
    accent: "#059669",
    bg: "#ecfdf5",
    dot: "#059669",
  },
};

function WorkItemRow({
  item,
  onUpdate,
  onDelete,
  accent,
}: {
  item: WorkItem;
  onUpdate: (field: keyof WorkItem, value: string) => void;
  onDelete: () => void;
  accent: string;
}) {
  return (
    <div className="group flex gap-3 items-start py-2.5 border-b border-[#eef0f5] last:border-0 hover:bg-white/60 rounded transition-colors px-1">
      <div
        className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: accent, marginTop: "6px" }}
      />
      <div className="flex-1 grid grid-cols-2 gap-3">
        <input
          value={item.project}
          onChange={(e) => onUpdate("project", e.target.value)}
          placeholder="專案 / 案子名稱"
          className="bg-transparent outline-none placeholder-[#b0b8c8] text-[#1a2236] w-full"
          style={{ fontSize: "0.93rem" }}
        />
        <input
          value={item.progress}
          onChange={(e) => onUpdate("progress", e.target.value)}
          placeholder="進度說明…"
          className="bg-transparent outline-none placeholder-[#b0b8c8] text-[#64748b] w-full"
          style={{ fontSize: "0.93rem" }}
        />
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#b0b8c8] hover:text-[#e05252] flex-shrink-0 mt-0.5"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function PlatformSection({
  platform,
  data,
  onAdd,
  onUpdate,
  onDelete,
}: {
  platform: Platform;
  data: PlatformData;
  onAdd: (status: "in-progress" | "upcoming") => void;
  onUpdate: (status: "in-progress" | "upcoming", id: string, field: keyof WorkItem, value: string) => void;
  onDelete: (status: "in-progress" | "upcoming", id: string) => void;
}) {
  const meta = PLATFORM_META[platform];

  return (
    <div className="rounded-xl border border-[#e4e8f0] bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e4e8f0]" style={{ backgroundColor: meta.bg }}>
        <span className="font-semibold text-[#1a2236]" style={{ fontSize: "1.02rem", letterSpacing: "0.04em" }}>
          {meta.label}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: meta.accent, fontSize: "0.68rem" }}
          >
            {data.inProgress.length + data.upcoming.length} 項
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: meta.accent, fontSize: "0.68rem", letterSpacing: "0.06em" }}
              >
                進行中
              </span>
              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{data.inProgress.length} 筆</span>
            </div>
            <button
              onClick={() => onAdd("in-progress")}
              className="flex items-center gap-1 text-[#94a3b8] hover:text-[#1a2236] transition-colors"
              style={{ fontSize: "0.86rem" }}
            >
              <Plus size={12} /> 新增
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 pb-1.5 border-b border-dashed border-[#e8ecf2]">
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.06em" }}>專案 / 需求</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.06em" }}>進度說明</span>
          </div>

          {data.inProgress.length === 0 && (
            <div className="text-center py-4 text-[#c8d0dc]" style={{ fontSize: "0.88rem" }}>
              尚無進行中項目
            </div>
          )}
          {data.inProgress.map((item) => (
            <WorkItemRow
              key={item.id}
              item={item}
              onUpdate={(f, v) => onUpdate("in-progress", item.id, f, v)}
              onDelete={() => onDelete("in-progress", item.id)}
              accent={meta.accent}
            />
          ))}
        </div>

        <div className="border-t border-dashed border-[#e4e8f0]" />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded border"
                style={{ borderColor: meta.accent, color: meta.accent, fontSize: "0.68rem", letterSpacing: "0.06em" }}
              >
                即將開始
              </span>
              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{data.upcoming.length} 筆</span>
            </div>
            <button
              onClick={() => onAdd("upcoming")}
              className="flex items-center gap-1 text-[#94a3b8] hover:text-[#1a2236] transition-colors"
              style={{ fontSize: "0.86rem" }}
            >
              <Plus size={12} /> 新增
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 pb-1.5 border-b border-dashed border-[#e8ecf2]">
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.06em" }}>專案 / 需求</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.06em" }}>預計進度</span>
          </div>

          {data.upcoming.length === 0 && (
            <div className="text-center py-4 text-[#c8d0dc]" style={{ fontSize: "0.88rem" }}>
              尚無即將開始項目
            </div>
          )}
          {data.upcoming.map((item) => (
            <WorkItemRow
              key={item.id}
              item={item}
              onUpdate={(f, v) => onUpdate("upcoming", item.id, f, v)}
              onDelete={() => onDelete("upcoming", item.id)}
              accent={meta.accent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DailyReport() {
  // ── 修改：使用函數式初始化，從 LocalStorage 讀取資料 ──
  
  const [reporter, setReporter] = useState(() => {
    return localStorage.getItem("dr_reporter") || "姓名";
  });
  
  const [department, setDepartment] = useState(() => {
    return localStorage.getItem("dr_dept") || "部門";
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const saved = localStorage.getItem("dr_date");
    return saved ? new Date(saved) : new Date(2026, 2, 18);
  });

  const [supervisorItems, setSupervisorItems] = useState<SupervisorItem[]>(() => {
    const saved = localStorage.getItem("dr_supervisor");
    return saved ? JSON.parse(saved) : [
      { id: uid(), index: 1, project: "", content: "", owner: "" },
    ];
  });

  const [platforms, setPlatforms] = useState<Record<Platform, PlatformData>>(() => {
    const saved = localStorage.getItem("dr_platforms");
    return saved ? JSON.parse(saved) : {
      frontend: { inProgress: [], upcoming: [] },
      middle: { inProgress: [], upcoming: [] },
      backend: { inProgress: [], upcoming: [] },
    };
  });

  // ── 修改：加入 useEffect 自動存檔 ──

  // 存檔基本資訊
  useEffect(() => {
    localStorage.setItem("dr_reporter", reporter);
    localStorage.setItem("dr_dept", department);
    localStorage.setItem("dr_date", selectedDate.toISOString());
  }, [reporter, department, selectedDate]);

  // 存檔主管呈報事項
  useEffect(() => {
    localStorage.setItem("dr_supervisor", JSON.stringify(supervisorItems));
  }, [supervisorItems]);

  // 存檔工作項目
  useEffect(() => {
    localStorage.setItem("dr_platforms", JSON.stringify(platforms));
  }, [platforms]);

  // ── Supervisor handlers (保持不變) ──
  const addSupervisorItem = () => {
    setSupervisorItems((prev) => [
      ...prev,
      { id: uid(), index: prev.length + 1, project: "", content: "", owner: "" },
    ]);
  };

  const updateSupervisorItem = (id: string, field: keyof SupervisorItem, value: string | number) => {
    setSupervisorItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const deleteSupervisorItem = (id: string) => {
    setSupervisorItems((prev) =>
      prev.filter((it) => it.id !== id).map((it, i) => ({ ...it, index: i + 1 }))
    );
  };

  // ── Platform handlers (保持不變) ──
  const addWorkItem = (platform: Platform, status: "in-progress" | "upcoming") => {
    const newItem: WorkItem = { id: uid(), project: "", progress: "", status };
    setPlatforms((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [status === "in-progress" ? "inProgress" : "upcoming"]: [
          ...prev[platform][status === "in-progress" ? "inProgress" : "upcoming"],
          newItem,
        ],
      },
    }));
  };

  const updateWorkItem = (
    platform: Platform,
    status: "in-progress" | "upcoming",
    id: string,
    field: keyof WorkItem,
    value: string
  ) => {
    const key = status === "in-progress" ? "inProgress" : "upcoming";
    setPlatforms((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [key]: prev[platform][key].map((it) => (it.id === id ? { ...it, [field]: value } : it)),
      },
    }));
  };

  const deleteWorkItem = (platform: Platform, status: "in-progress" | "upcoming", id: string) => {
    const key = status === "in-progress" ? "inProgress" : "upcoming";
    setPlatforms((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [key]: prev[platform][key].filter((it) => it.id !== id),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#f0f3f8]" style={{ fontFamily: "'Inter', 'PingFang TC', 'Noto Sans TC', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* ── Document Header ── */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-8 rounded-full bg-[#0f1f3d]" />
              <h1 className="text-[#0f1f3d]" style={{ letterSpacing: "0.12em" }}>
                工作日報
              </h1>
            </div>
            <div className="flex items-center gap-4 pl-3.5">
              <DatePicker value={selectedDate} onChange={setSelectedDate} />
            </div>
          </div>

          <div className="flex items-center gap-5 pb-1">
            <div className="flex items-center gap-2 text-[#64748b]" style={{ fontSize: "0.88rem" }}>
              <Building2 size={13} />
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-transparent outline-none text-[#1a2236] w-20 border-b border-transparent hover:border-[#c8d0dc] focus:border-[#0f1f3d] transition-colors pb-0.5"
                style={{ fontSize: "0.88rem" }}
              />
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1f3d] text-white hover:bg-[#1a3460] transition-colors"
              style={{ fontSize: "0.86rem" }}
            >
              <Printer size={13} />
              列印
            </button>
          </div>
        </div>

        {/* ── Section 1: Supervisor Report ── */}
        <div className="rounded-xl border border-[#e4e8f0] bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f1f3d] text-white">
            <div className="flex items-center gap-2.5">
              <span
                className="px-2 py-0.5 rounded bg-white/10 text-white/80"
                style={{ fontSize: "0.78rem", letterSpacing: "0.1em" }}
              >
                SECTION 01
              </span>
              <span style={{ fontSize: "0.98rem", letterSpacing: "0.08em" }}>呈報主管事項</span>
            </div>
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
              {supervisorItems.length} 項
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e4e8f0] bg-[#f7f9fc]">
                  <th className="py-2.5 px-4 text-center w-12" style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 500 }}>
                    #
                  </th>
                  <th className="py-2.5 px-4 text-left w-40" style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 500 }}>
                    專案 / 需求
                  </th>
                  <th className="py-2.5 px-4 text-left" style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 500 }}>
                    報告內容
                  </th>
                  <th className="py-2.5 px-4 text-left w-32" style={{ fontSize: "0.8rem", color: "#94a3b8", letterSpacing: "0.08em", fontWeight: 500 }}>
                    負責窗口
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {supervisorItems.map((item, i) => (
                  <SupervisorRow
                    key={item.id}
                    item={item}
                    onUpdate={(f, v) => updateSupervisorItem(item.id, f, v)}
                    onDelete={() => deleteSupervisorItem(item.id)}
                    isLast={i === supervisorItems.length - 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-dashed border-[#e4e8f0]">
            <button
              onClick={addSupervisorItem}
              className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#0f1f3d] transition-colors"
              style={{ fontSize: "0.78rem" }}
            >
              <Plus size={14} />
              新增列
            </button>
          </div>
        </div>

        {/* ── Section 2: Platform Work Report ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="px-2 py-0.5 rounded bg-[#0f1f3d] text-white"
                style={{ fontSize: "0.78rem", letterSpacing: "0.1em" }}
              >
                SECTION 02
              </span>
              <span className="text-[#0f1f3d]" style={{ fontSize: "1.02rem", letterSpacing: "0.06em", fontWeight: 600 }}>
                工作項目
              </span>
            </div>
            <div className="flex-1 h-px bg-[#e4e8f0]" />
            <div className="flex items-center gap-2">
              {(["frontend", "middle", "backend"] as Platform[]).map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1"
                  style={{ fontSize: "0.72rem", color: "#64748b" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: PLATFORM_META[p].accent }}
                  />
                  {PLATFORM_META[p].label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(["frontend", "middle", "backend"] as Platform[]).map((platform) => (
              <PlatformSection
                key={platform}
                platform={platform}
                data={platforms[platform]}
                onAdd={(status) => addWorkItem(platform, status)}
                onUpdate={(status, id, field, value) => updateWorkItem(platform, status, id, field, value)}
                onDelete={(status, id) => deleteWorkItem(platform, status, id)}
              />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <div className="h-px flex-1 bg-[#e4e8f0]" />
          <span className="mx-4 text-[#c8d0dc]" style={{ fontSize: "0.8rem", letterSpacing: "0.1em" }}>
            DAILY WORK REPORT · {selectedDate.toLocaleDateString("zh-TW")}
          </span>
          <div className="h-px flex-1 bg-[#e4e8f0]" />
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

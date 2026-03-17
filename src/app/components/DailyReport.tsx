import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, User, Building2, Printer } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { supabase } from "../../supabaseClient"; // 確保路徑指向你的 supabaseClient.ts

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

// ─── Sub-components ──────────────────────────────────────────────────────────

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
}: {
  item: SupervisorItem;
  onUpdate: (field: keyof SupervisorItem, value: string | number) => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group border-b border-[#e8ecf2] hover:bg-[#f7f9fc] transition-colors">
      <td className="py-3 px-4 text-center w-12">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0f1f3d] text-white" style={{ fontSize: "0.72rem" }}>
          {item.index}
        </span>
      </td>
      <td className="py-3 px-4 w-40">
        <EditableCell value={item.project} onChange={(v) => onUpdate("project", v)} placeholder="專案名稱" />
      </td>
      <td className="py-3 px-4">
        <EditableCell value={item.content} onChange={(v) => onUpdate("content", v)} placeholder="報告重點…" multiline />
      </td>
      <td className="py-3 px-4 w-32">
        <EditableCell value={item.owner} onChange={(v) => onUpdate("owner", v)} placeholder="姓名" />
      </td>
      <td className="py-2 px-2 w-10 text-right">
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-[#b0b8c8] hover:text-[#e05252] transition-opacity">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

const PLATFORM_META: Record<Platform, { label: string; accent: string; bg: string }> = {
  frontend: { label: "前台", accent: "#2563eb", bg: "#eff6ff" },
  middle: { label: "中台", accent: "#7c3aed", bg: "#f5f3ff" },
  backend: { label: "後台", accent: "#059669", bg: "#ecfdf5" },
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
    <div className="group flex gap-3 items-start py-2.5 border-b border-[#eef0f5] last:border-0 px-1">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <div className="flex-1 grid grid-cols-2 gap-3">
        <input value={item.project} onChange={(e) => onUpdate("project", e.target.value)} placeholder="專案" className="bg-transparent outline-none text-[#1a2236]" style={{ fontSize: "0.93rem" }} />
        <input value={item.progress} onChange={(e) => onUpdate("progress", e.target.value)} placeholder="進度" className="bg-transparent outline-none text-[#64748b]" style={{ fontSize: "0.93rem" }} />
      </div>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-[#b0b8c8] hover:text-[#e05252] mt-0.5">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DailyReport() {
  const [reporter, setReporter] = useState("姓名");
  const [department, setDepartment] = useState("部門");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [supervisorItems, setSupervisorItems] = useState<SupervisorItem[]>([]);
  const [platforms, setPlatforms] = useState<Record<Platform, PlatformData>>({
    frontend: { inProgress: [], upcoming: [] },
    middle: { inProgress: [], upcoming: [] },
    backend: { inProgress: [], upcoming: [] },
  });

  // 1. 初始化：從 Supabase 抓取資料
  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from("daily_reports").select("content").eq("id", 1).single();
      if (data?.content) {
        const c = data.content;
        setReporter(c.reporter || "姓名");
        setDepartment(c.department || "部門");
        setSupervisorItems(c.supervisorItems || []);
        setPlatforms(c.platforms || platforms);
        if (c.selectedDate) setSelectedDate(new Date(c.selectedDate));
      }
    };
    loadData();
  }, []);

  // 2. 實時監聽：同步其他人的編輯
  useEffect(() => {
    const channel = supabase
      .channel("realtime_report")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "daily_reports", filter: "id=eq.1" }, (payload) => {
        const next = payload.new.content;
        setReporter(next.reporter);
        setDepartment(next.department);
        setSupervisorItems(next.supervisorItems);
        setPlatforms(next.platforms);
        setSelectedDate(new Date(next.selectedDate));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // 3. 自動存檔 (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      await supabase.from("daily_reports").upsert({
        id: 1,
        content: { reporter, department, selectedDate, supervisorItems, platforms },
        updated_at: new Date(),
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [reporter, department, selectedDate, supervisorItems, platforms]);

  // Handlers
  const addSup = () => setSupervisorItems([...supervisorItems, { id: uid(), index: supervisorItems.length + 1, project: "", content: "", owner: "" }]);
  const updateSup = (id: string, f: keyof SupervisorItem, v: any) => setSupervisorItems(supervisorItems.map(it => it.id === id ? { ...it, [f]: v } : it));
  const delSup = (id: string) => setSupervisorItems(supervisorItems.filter(it => it.id !== id).map((it, i) => ({ ...it, index: i + 1 })));

  const addWork = (p: Platform, s: "in-progress" | "upcoming") => {
    const key = s === "in-progress" ? "inProgress" : "upcoming";
    setPlatforms({ ...platforms, [p]: { ...platforms[p], [key]: [...platforms[p][key], { id: uid(), project: "", progress: "", status: s }] } });
  };

  return (
    <div className="min-h-screen bg-[#f0f3f8] py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-[#0f1f3d] text-3xl font-bold tracking-widest flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#0f1f3d] rounded-full" /> 工作日報 <span className="text-sm font-normal text-slate-400">REALTIME</span>
            </h1>
            <div className="flex items-center gap-4 pl-4">
              <DatePicker value={selectedDate} onChange={setSelectedDate} />
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <User size={14} />
                <input value={reporter} onChange={(e) => setReporter(e.target.value)} className="bg-transparent border-b border-transparent hover:border-slate-300 outline-none w-20" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Building2 size={14} />
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-transparent border-b border-transparent hover:border-slate-300 outline-none w-20" />
            </div>
            <button onClick={() => window.print()} className="bg-[#0f1f3d] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
              <Printer size={14} /> 列印日報
            </button>
          </div>
        </div>

        {/* Section 1: Supervisor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#0f1f3d] text-white px-5 py-3 flex justify-between items-center">
            <span className="text-sm tracking-wider font-medium">SECTION 01 / 呈報主管事項</span>
            <button onClick={addSup} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md transition-colors flex items-center gap-1">
              <Plus size={12} /> 新增
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs text-left">
              <tr>
                <th className="p-3 text-center w-12">#</th>
                <th className="p-3 w-40">專案名稱</th>
                <th className="p-3">報告內容</th>
                <th className="p-3 w-32">負責窗口</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {supervisorItems.map(item => (
                <SupervisorRow key={item.id} item={item} onUpdate={(f, v) => updateSup(item.id, f, v)} onDelete={() => delSup(item.id)} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Platforms */}
        <div className="grid grid-cols-3 gap-6">
          {(["frontend", "middle", "backend"] as Platform[]).map(p => (
            <div key={p} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center" style={{ backgroundColor: PLATFORM_META[p].bg }}>
                <span className="font-bold text-slate-700">{PLATFORM_META[p].label}開發</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-400">
                  {platforms[p].inProgress.length + platforms[p].upcoming.length} Tasks
                </span>
              </div>
              <div className="p-4 space-y-6">
                {/* In Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: PLATFORM_META[p].accent }}>進行中</span>
                    <button onClick={() => addWork(p, "in-progress")} className="text-slate-300 hover:text-slate-600"><Plus size={14} /></button>
                  </div>
                  {platforms[p].inProgress.map(item => (
                    <WorkItemRow key={item.id} item={item} accent={PLATFORM_META[p].accent} 
                      onUpdate={(f, v) => {
                        const next = platforms[p].inProgress.map(i => i.id === item.id ? { ...i, [f]: v } : i);
                        setPlatforms({ ...platforms, [p]: { ...platforms[p], inProgress: next } });
                      }}
                      onDelete={() => setPlatforms({ ...platforms, [p]: { ...platforms[p], inProgress: platforms[p].inProgress.filter(i => i.id !== item.id) } })}
                    />
                  ))}
                </div>
                {/* Upcoming */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold border px-2 py-0.5 rounded" style={{ borderColor: PLATFORM_META[p].accent, color: PLATFORM_META[p].accent }}>待處理</span>
                    <button onClick={() => addWork(p, "upcoming")} className="text-slate-300 hover:text-slate-600"><Plus size={14} /></button>
                  </div>
                  {platforms[p].upcoming.map(item => (
                    <WorkItemRow key={item.id} item={item} accent={PLATFORM_META[p].accent}
                      onUpdate={(f, v) => {
                        const next = platforms[p].upcoming.map(i => i.id === item.id ? { ...i, [f]: v } : i);
                        setPlatforms({ ...platforms, [p]: { ...platforms[p], upcoming: next } });
                      }}
                      onDelete={() => setPlatforms({ ...platforms, [p]: { ...platforms[p], upcoming: platforms[p].upcoming.filter(i => i.id !== item.id) } })}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media print { button { display: none !important; } body { background: white; } .shadow-sm { box-shadow: none !important; } }`}</style>
    </div>
  );
}

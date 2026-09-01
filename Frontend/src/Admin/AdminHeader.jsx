import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu, Search, Bell, Settings, User, LogOut, ChevronDown,
  ShoppingBag, Package, Clock, X, LayoutDashboard, MessageSquare,
  Users, CreditCard, UserCheck, ClipboardList, Activity, UserRound,
  CalendarCheck, Receipt, ShoppingCart, BarChart3, Dumbbell, Send,
  Boxes, Plus, PhoneCall, HeartPulse, FolderKanban, CheckSquare,
  DollarSign, CalendarOff, BookOpen, GraduationCap, CalendarDays,
  CalendarClock, TrendingUp,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../PrivateRouter/AuthContext";
import dayjs from "dayjs";

/* ── page title map ── */
const pageInfo = {
  "/admin":                         { title: "Dashboard",             icon: LayoutDashboard },
  "/admin/employees":               { title: "Employees",             icon: Users },
  "/admin/projects":                { title: "Project Management",    icon: FolderKanban },
  "/admin/tasks":                   { title: "Task Management",       icon: CheckSquare },
  "/admin/trainees":                { title: "Trainees Management",   icon: GraduationCap },
  "/admin/internships":             { title: "Internship Management", icon: BookOpen },
  "/admin/expenses":                { title: "Expenses",              icon: Receipt },
  "/admin/payroll":                 { title: "Payroll",               icon: DollarSign },
  "/admin/leaves":                  { title: "Leave Management",      icon: CalendarOff },
  "/admin/attendance":              { title: "Attendance",            icon: CalendarCheck },
  "/admin/reports":                 { title: "Reports",               icon: BarChart3 },
  "/admin/office-calendar":         { title: "Office Calendar",       icon: CalendarDays },
  "/admin/my-calendar":             { title: "My Daily Calendar",     icon: CalendarClock },
  "/admin/followupenquriy":         { title: "Follow Up Enquiry",     icon: PhoneCall },
  "/admin/members":                 { title: "Members",               icon: Users },
  "/admin/payments":                { title: "Payments",              icon: CreditCard },
  "/admin/billing":                 { title: "Billing",               icon: Receipt },
  "/admin/orders":                  { title: "Orders",                icon: ShoppingCart },
  "/admin/settings":                { title: "Settings",              icon: Settings },
  "/admin/settings/profile":        { title: "Profile",               icon: User },
  "/admin/send-message":            { title: "Bulk Messaging",        icon: Send },
};

/* ── helpers ── */
const getPageInfo = (pathname) => {
  const sorted = Object.entries(pageInfo).sort((a, b) => b[0].length - a[0].length);
  for (const [path, info] of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) return info;
  }
  return { title: "Dashboard", icon: LayoutDashboard };
};

const AlertDropdown = ({ title, items, icon, type, onClose, accent }) => {
  let viewAllLink = "/admin";
  if (type === "tasks") viewAllLink = "/admin/tasks";
  if (type === "projects") viewAllLink = "/admin/projects";
  if (type === "leaves") viewAllLink = "/admin/employees/leave";

  return (
    <div className="absolute right-0 top-full mt-3 w-80 bg-[#13141a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <span className="text-sm font-bold text-white flex items-center gap-2">{icon} {title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${accent}`}>{items.length} Active</span>
      </div>
      {/* list */}
      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
        {items.length ? items.map((item, i) => {
          let link = "/admin", label = "", sub = "";
          if (type === "tasks")    { 
            link = "/admin/tasks";           
            label = item.title;    
            sub = `${item.status} ${item.assigned ? '· ' + item.assigned + (item.assignedId ? ' (' + item.assignedId + ')' : '') : ''}`; 
          }
          if (type === "projects") { link = "/admin/projects";        label = item.name;     sub = `Due: ${item.due}`; }
          if (type === "leaves")   { link = "/admin/employees/leave"; label = item.employee; sub = `${item.type}${item.date ? ' · ' + item.date : ''}`; }
          return (
            <Link key={i} to={link} onClick={onClose} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition group">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-primary transition">{label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
              </div>
            </Link>
          );
        }) : (
          <div className="py-8 text-center text-white/30 text-xs">No active items</div>
        )}
      </div>
      <Link to={viewAllLink} onClick={onClose} className="block text-center py-2.5 border-t border-white/10 text-[11px] font-bold text-primary hover:bg-primary/10 transition uppercase tracking-widest">
        View All
      </Link>
    </div>
  );
};

/* ══════════════════ MAIN HEADER ══════════════════ */
const Header = ({ onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState({ tasks: [], leaves: [] });
  const [currentTime, setCurrentTime] = useState(dayjs());

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);
  const inputRef    = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { profileName, role, email, logout } = useAuth();

  const userName = profileName || "Admin";
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Administrator";
  const { title: pageTitle, icon: PageIcon } = getPageInfo(location.pathname);

  /* clock */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  /* fetch live data — pending leaves + active task updates */
  useEffect(() => {
    const fetchAlerts = async () => {
      let leaveAlerts = [];
      let taskAlerts  = [];

      // ── 1. Pending Leaves from employee_leaves table ──
      try {
        const { data } = await api.get('/employee-leaves/all');
        const pending = (data?.data || []).filter(l => l.status === 'Pending');
        leaveAlerts = pending.map(l => ({
          employee: `${l.first_name || ''} ${l.last_name || ''}`.trim(),
          type:     l.leave_type || 'Leave',
          date:     l.from_date ? dayjs(l.from_date).format('DD MMM YYYY') : '',
        }));
      } catch (e) {
        console.error('[Header] Leave fetch error:', e?.response?.status, e.message);
      }

      // ── 2. Active Task Updates from employee_task_assignments ──
      try {
        const { data } = await api.get('/tasks', { params: { page: 1, limit: 100 } });
        const active = (data?.data || []).filter(t => {
          const s = (t.status || '').toLowerCase().trim();
          // Show Pending, In Progress, On Hold — i.e. not yet done
          if (s === 'completed' || s === 'cancelled' || s === 'done') return false;
          // Only show tasks updated today
          if (!t.updated_at) return false;
          return dayjs(t.updated_at).isSame(dayjs(), 'day');
        });
        taskAlerts = active.map(t => ({
          title:    t.task_name || t.module_name || t.name || 'Untitled Task',
          project:  t.project_name || '',
          assigned: t.assigned_to_name || '',
          assignedId: t.assigned_to_code || t.employee_code || t.assigned_to || '',
          status:   t.status || 'Pending',
        }));
      } catch (e) {
        console.error('[Header] Tasks fetch error:', e?.response?.status, e.message);
      }

      setAlerts({ tasks: taskAlerts, leaves: leaveAlerts });
    };

    fetchAlerts();
  }, []);

  /* focus search */
  useEffect(() => { if (showSearch) inputRef.current?.focus(); }, [showSearch]);

  /* click outside */
  useEffect(() => {
    const h = (e) => {
      if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) setActiveDropdown(null);
      if (showSearch && searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [activeDropdown, showSearch]);

  const toggle = (name) => setActiveDropdown(p => p === name ? null : name);
  const totalAlerts = alerts.leaves.length + alerts.tasks.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    let target = "/admin/members";
    if (location.pathname.includes("projects"))  target = "/admin/projects";
    if (location.pathname.includes("employees")) target = "/admin/employees";
    navigate(`${target}?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleLogout = () => {
    logout();
    setActiveDropdown(null);
    window.location.hash = "#/";
  };

  /* icon button helper */
  const IconBtn = ({ name, badge, badgeColor, title, children }) => (
    <div className="relative">
      <button
        onClick={() => toggle(name)}
        title={title}
        className={`relative flex items-center justify-center w-[42px] h-[42px] rounded-2xl transition-all duration-200 border
          ${activeDropdown === name
            ? "bg-gray-100 border-gray-200 text-gray-900 shadow-sm"
            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
      >
        {children}
        {badge > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${badgeColor}`}>
            {badge}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-white backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-18" ref={dropdownRef}>

          {/* ── HAMBURGER (mobile) ── */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition shrink-0"
          >
            <Menu size={18} />
          </button>

          {/* ── PAGE TITLE ── */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/15 border border-[#d4a843]/30 flex items-center justify-center shrink-0">
              <PageIcon size={16} className="text-[#d4a843]" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 truncate leading-tight">{pageTitle}</h1>
              <p className="text-[10px] text-gray-500 leading-none">
                {currentTime.format("ddd, DD MMM YYYY")} · {currentTime.format("hh:mm:ss A")}
              </p>
            </div>
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search */}
            <button
              onClick={() => setShowSearch(p => !p)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition text-xs"
            >
              <Search size={14} />
              <span className="hidden md:block">Search...</span>
              <span className="hidden md:block text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md">⌘K</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Task Updates - live from employee_task_assignments */}
            <div className="relative">
              <IconBtn name="tasks" badge={alerts.tasks.length} badgeColor="bg-blue-500" title="Task Updates">
                <CheckSquare size={18} />
              </IconBtn>
              {activeDropdown === "tasks" && (
                <AlertDropdown title="Task Updates" items={alerts.tasks} icon={<CheckSquare size={13} className="text-blue-400" />} type="tasks" onClose={() => setActiveDropdown(null)} accent="bg-blue-500/20 text-blue-400" />
              )}
            </div>

            {/* Leave Requests - live from employee_leaves table */}
            <div className="relative">
              <IconBtn name="leaves" badge={alerts.leaves.length} badgeColor="bg-yellow-500" title="Pending Leave Requests">
                <CalendarOff size={18} />
              </IconBtn>
              {activeDropdown === "leaves" && (
                <AlertDropdown title="Leave Requests" items={alerts.leaves} icon={<CalendarOff size={13} className="text-yellow-400" />} type="leaves" onClose={() => setActiveDropdown(null)} accent="bg-yellow-500/20 text-yellow-400" />
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* ── USER PROFILE ── */}
            <div className="relative ml-1 sm:ml-2">
              <button
                onClick={() => toggle("profile")}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-2xl transition-all duration-200 border
                  ${activeDropdown === "profile"
                    ? "bg-gray-100 border-gray-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                  }`}
              >
                <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-[#1a2e28] to-[#2c473f] border border-[#1a2e28] flex items-center justify-center text-white text-sm font-bold shadow-inner">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col items-start pr-1">
                  <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                    {userRole}
                  </span>
                </div>
                <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
              </button>

              {/* Profile dropdown */}
              {activeDropdown === "profile" && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-base font-bold shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                      <p className="text-[10px] text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link to="/admin/settings/profile" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-sm text-gray-700 transition">
                      <User size={15} className="text-gray-500" /> Profile
                    </Link>
                    <Link to="/admin/settings" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-sm text-gray-700 transition">
                      <Settings size={15} className="text-gray-500" /> Settings
                    </Link>
                    <div className="h-px bg-gray-200 my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-500 transition">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showSearch && (
        <div ref={searchRef} className="absolute right-4 top-20 z-50 w-[min(92vw,420px)] rounded-2xl border border-gray-200 bg-[#111827] text-white shadow-2xl">
          <form onSubmit={handleSearch} className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <Search size={15} className="text-white/50" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees, projects, tasks..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-md hover:bg-white/10"
                  aria-label="Clear search"
                >
                  <X size={14} className="text-white/60" />
                </button>
              )}
            </div>
          </form>

          <div className="px-5 py-3">
            <p className="text-[11px] text-white/30 uppercase tracking-widest mb-2">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Employees", path: "/admin/employees" },
                { label: "Projects", path: "/admin/projects" },
                { label: "Attendance", path: "/admin/attendance" },
                { label: "Payroll", path: "/admin/payroll" },
                { label: "Reports", path: "/admin/reports" },
              ].map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-white/60 text-xs transition border border-white/8"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-5 py-2 text-[10px] text-white/20 flex justify-between border-t border-white/5">
            <span>Press <kbd className="bg-white/10 px-1 rounded">Enter</kbd> to search</span>
            <span>Press <kbd className="bg-white/10 px-1 rounded">Esc</kbd> to close</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

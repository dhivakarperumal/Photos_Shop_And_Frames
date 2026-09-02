import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  ChevronDown,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import api from "../api";

/* =============== HELPERS =============== */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const avatarColors = [
  "bg-[#d4a843] text-[#162420]",
  "bg-[#4f88b2] text-white",
  "bg-[#7d5a93] text-white",
  "bg-[#2d7b5a] text-white",
  "bg-[#d04d4d] text-white",
  "bg-[#1a3c36] text-white",
];

const getAvatarColor = (str = "") => {
  const sum = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[sum % avatarColors.length];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ROLES = ["All Roles", "Super Admin", "Admin", "user"];
const STATUSES = ["All Status", "Active", "Inactive"];
const PAGE_SIZES = [10, 25, 50];

/* =============== COMPONENT =============== */
const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ---------- FETCH ---------- */
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/users");
      setCustomers(data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to fetch customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [refreshKey]);

  /* ---------- FILTER + SEARCH ---------- */
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        !search ||
        c.username?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.user_id?.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === "All Roles" || c.role === roleFilter;

      const matchStatus =
        statusFilter === "All Status" || c.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [customers, search, roleFilter, statusFilter]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, pageSize]);

  /* ---------- STAT CARDS ---------- */
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const inactiveCustomers = customers.filter((c) => c.status !== "Active").length;
  const adminCount = customers.filter((c) =>
    ["Admin", "Super Admin"].includes(c.role)
  ).length;

  const statCards = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: <Users className="h-6 w-6" />,
      accent: "bg-[#e8f3eb]",
      iconColor: "text-[#2d7b5a]",
      trend: `${totalCustomers} total`,
    },
    {
      title: "Active",
      value: activeCustomers,
      icon: <UserCheck className="h-6 w-6" />,
      accent: "bg-[#eaf7f1]",
      iconColor: "text-[#2d7b5a]",
      trend:
        totalCustomers > 0
          ? `${Math.round((activeCustomers / totalCustomers) * 100)}% of total`
          : "0% of total",
    },
    {
      title: "Inactive",
      value: inactiveCustomers,
      icon: <UserX className="h-6 w-6" />,
      accent: "bg-[#fff0f0]",
      iconColor: "text-[#d04d4d]",
      trend:
        totalCustomers > 0
          ? `${Math.round((inactiveCustomers / totalCustomers) * 100)}% of total`
          : "0% of total",
    },
    {
      title: "Admins",
      value: adminCount,
      icon: <Shield className="h-6 w-6" />,
      accent: "bg-[#f1e7f7]",
      iconColor: "text-[#7d5a93]",
      trend: "Admin & Super Admin",
    },
  ];

  /* ---------- EXPORT CSV ---------- */
  const handleExport = () => {
    const headers = ["Username", "Email", "Role", "Status", "Joined"];
    const rows = filtered.map((c) => [
      c.username,
      c.email,
      c.role,
      c.status,
      formatDate(c.created_at),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- PAGINATION PAGES ---------- */
  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  };

  /* =============== RENDER =============== */
  return (
    <div className="min-h-screen bg-[#f2f3f0] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">

        {/* PAGE HEADER */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1d1b]">
              Customers
            </h1>
            <p className="mt-2 text-[13px] text-[#646464]">
              Dashboard <span className="mx-2 text-[#9a9a9a]">&gt;</span>
              <span className="font-medium text-[#2a2a2a]">Customers</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
              className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-[18px] border border-[#e7e0d8] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${card.accent} ${card.iconColor}`}
                >
                  {card.icon}
                </div>
                <div className="ml-auto text-right">
                  <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#2d7b5a]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {card.trend}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-[13px] font-medium text-[#666666]">
                  {card.title}
                </div>
                <div className="mt-2 text-[2.2rem] font-bold leading-none tracking-[-0.08em] text-[#1e1e1e]">
                  {loading ? "—" : card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE CARD */}
        <div className="rounded-[18px] border border-[#e7e0d8] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)]">

          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full max-w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="h-[46px] w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-10 pr-3 text-[14px] text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
                />
              </div>

              {/* Role filter */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-[46px] appearance-none rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-3 pr-9 text-[14px] font-medium text-[#2d2d2d] outline-none focus:border-[#d2bc8a] cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-[46px] appearance-none rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-3 pr-9 text-[14px] font-medium text-[#2d2d2d] outline-none focus:border-[#d2bc8a] cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>
            </div>

            {/* Page size */}
            <div className="flex items-center gap-2 text-[13px] text-[#6a6a6a]">
              <span>Show</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-[38px] appearance-none rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-3 pr-8 text-[13px] font-medium text-[#2d2d2d] outline-none cursor-pointer"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666]" />
              </div>
              <span>entries</span>
            </div>
          </div>

          {/* TABLE */}
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UserX className="mb-3 h-12 w-12 text-[#d04d4d]" />
              <p className="text-[15px] font-semibold text-[#d04d4d]">{error}</p>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="mt-4 rounded-xl bg-[#1a3c36] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#214a42]"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-[#d4a843]" />
              <span className="ml-3 text-[15px] text-[#5a5a5a]">Loading customers...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="mb-3 h-12 w-12 text-[#c9c2ba]" />
              <p className="text-[15px] font-semibold text-[#4d4d4d]">No customers found</p>
              <p className="mt-1 text-[13px] text-[#7a7a7a]">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#f0e6d2] text-left text-sm font-semibold text-[#3d3d3d]">
                    <th className="rounded-tl-xl px-4 py-4">#</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Joined</th>
                    <th className="rounded-tr-xl px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((customer, idx) => {
                    const isActive = customer.status === "Active";
                    const isAdmin = ["Admin", "Super Admin"].includes(customer.role);
                    const rowNum = (page - 1) * pageSize + idx + 1;

                    return (
                      <tr
                        key={customer.id || customer.user_id}
                        className="border-t border-[#f0ebe6] align-middle transition-colors hover:bg-[#faf8f5]"
                      >
                        {/* Row # */}
                        <td className="px-4 py-4 text-sm text-[#9a9a9a]">{rowNum}</td>

                        {/* Avatar + Name */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getAvatarColor(
                                customer.username || ""
                              )}`}
                            >
                              {getInitials(customer.username)}
                            </div>
                            <div>
                              <div className="text-[15px] font-semibold text-[#1f1f1f]">
                                {customer.username || "—"}
                              </div>
                              <div className="text-[11px] text-[#8a8a8a]">
                                ID: {customer.user_id || customer.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 text-sm text-[#4d4d4d]">
                          {customer.email || "—"}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isAdmin
                                ? "bg-[#f1e7f7] text-[#7d5a93]"
                                : "bg-[#e8eefb] text-[#4f88b2]"
                            }`}
                          >
                            {isAdmin && <Shield className="h-3 w-3" />}
                            {customer.role || "user"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-[#edf7f1] text-[#2d7b5a]"
                                : "bg-[#fff0f0] text-[#d04d4d]"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isActive ? "bg-[#2d7b5a]" : "bg-[#d04d4d]"
                              }`}
                            />
                            {customer.status || "Active"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-4 text-sm text-[#5a5a5a]">
                          {formatDate(customer.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2d9cf] bg-white text-[#4d4d4d] transition hover:border-[#d0b997] hover:text-[#1a1a1a]"
                              title="View customer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#f3d7d7] bg-[#fff8f8] text-[#d04d4d] transition hover:bg-[#fff0f0]"
                              title="Delete customer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 border-t border-[#efebe7] pt-4 text-sm text-[#6a6a6a] md:flex-row md:items-center md:justify-between">
              <span>
                Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}
                {`\u2013`}
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} customer
                {filtered.length !== 1 ? "s" : ""}
                {customers.length !== filtered.length &&
                  ` (filtered from ${customers.length})`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#7d7d7d] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-medium transition ${
                      p === page
                        ? "bg-[#173b35] text-white"
                        : "border border-[#e3dbd2] bg-white text-[#4d4d4d] hover:bg-[#faf7f3]"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#7d7d7d] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Edit3, List, LayoutGrid, Printer, Search, ShoppingBag, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const emptyOrder = { id: "", customer: "-", phone: "-", items: 0, date: "-", time: "-", amount: 0, status: "Pending", orderItems: [] };
const ALL_ORDERS = "All Orders";
const products = [];

const formatCurrency = (value) => `₹ ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const statusClass = {
  Confirmed: "bg-[#e6f7ed] text-[#18794e]",
  Preparing: "bg-[#e9f1ff] text-[#3069c5]",
  Ready: "bg-[#f0e9ff] text-[#6c3bc0]",
  Completed: "bg-[#e6f7ed] text-[#18794e]",
  Cancelled: "bg-[#ffe9e9] text-[#cf4545]",
};

const Billing = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(emptyOrder);
  const [activeStatus, setActiveStatus] = useState(ALL_ORDERS);
  const [viewMode, setViewMode] = useState("table");
  const [receivedAmount, setReceivedAmount] = useState("1300");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        const savedOrders = Array.isArray(response.data?.data) ? response.data.data : [];
        const mappedOrders = savedOrders.map((order) => ({
          id: order.order_id,
          customer: order.address?.customer_name || order.customer_id || "Customer",
          phone: order.address?.mobile_number || "",
          items: Number(order.total_items || order.items?.length || 0),
          date: order.order_date ? new Date(order.order_date).toLocaleDateString("en-GB") : "-",
          time: order.created_at ? new Date(order.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "-",
          amount: Number(order.total_amount || 0),
          status: order.order_status || "Pending",
          email: order.address?.email || "",
          address: order.address,
          orderItems: order.items || [],
        }));
        setOrders(mappedOrders);
        setSelectedOrder(mappedOrders[0] || emptyOrder);
      } catch (error) {
        console.error("Failed to load billing orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || `${order.id} ${order.customer} ${order.phone}`.toLowerCase().includes(query);
    const matchesStatus = activeStatus === ALL_ORDERS || order.status === activeStatus;
    return matchesSearch && matchesStatus;
  }), [search, activeStatus]);

  const selectedOrderItems = selectedOrder?.orderItems || [];

  const subtotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const discount = 598;
  const total = Math.max(subtotal - discount, 0);
  const change = Math.max(Number(receivedAmount || 0) - total, 0);

  return (
    <div className={`billing-page ${viewMode === "card" ? "card-mode" : ""} min-h-screen bg-[#f3f4f6] p-4 text-[#1f2937] md:p-6`}>
      <div className="mx-auto max-w-[1500px]">
        <style>{`.billing-page.card-mode table { display: none; } .billing-page.card-mode .card-mode-only { display: grid; }`}</style>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1f2937]">Shop Billing</h1>
            <p className="mt-1 text-xs text-[#6b7280]">Dashboard <span className="mx-2">&gt;</span> Billing <span className="mx-2">&gt;</span> Shop Billing</p>
          </div>
          <button type="button" onClick={() => navigate("/admin/billing/new")} className="inline-flex items-center gap-2 rounded-lg border border-[#ff8a4c] bg-white px-4 py-2.5 text-sm font-semibold text-[#ed6b26]"><span className="text-lg leading-none">+</span> New Billing</button>
        </div>

        <div className="mb-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[{ label: "Total Amount", value: "₹ 1,29,850.00", note: "All time total billed amount", icon: Wallet, color: "#ff6b22", bg: "#fff0e7" }, { label: "Today's Order", value: "18", note: "Total orders today", icon: ShoppingBag, color: "#198754", bg: "#e8f7ed" }, { label: "Today's Amount", value: "₹ 24,680.00", note: "Total amount of today's orders", icon: Wallet, color: "#1769e0", bg: "#eaf1ff" }, { label: "Average Order Value", value: "₹ 1,371.11", note: "Average value today", icon: Check, color: "#6b21c9", bg: "#f1eaff" }].map((stat) => {
            const Icon = stat.icon;
            return <div key={stat.label} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white p-4"><div><p className="text-xs font-medium text-[#374151]">{stat.label}</p><p className="mt-2 text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p><p className="mt-2 text-[10px] text-[#6b7280]">{stat.note}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: stat.bg, color: stat.color }}><Icon className="h-6 w-6" /></div></div>;
          })}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.1fr]">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-3">
            <div className="mb-3 flex flex-col gap-2 md:flex-row"><div className="flex flex-1 gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by Order ID / Customer / Mobile..." className="h-10 w-full rounded-md border border-[#e5e7eb] pl-9 pr-3 text-xs outline-none focus:border-[#ff8a4c]" /></div><label className="relative w-36"><select value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#e5e7eb] bg-white px-3 pr-8 text-xs outline-none"><option>All Orders</option><option>Confirmed</option><option>Preparing</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" /></label></div><div className="flex overflow-hidden rounded-md border border-[#e5e7eb] bg-white"><button type="button" onClick={() => setViewMode("table")} aria-label="Table view" className={`flex h-10 w-10 items-center justify-center ${viewMode === "table" ? "bg-[#1a3c36] text-white" : "text-[#6b7280] hover:bg-[#f7f7f7]"}`}><List className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode("card")} aria-label="Card view" className={`flex h-10 w-10 items-center justify-center ${viewMode === "card" ? "bg-[#1a3c36] text-white" : "text-[#6b7280] hover:bg-[#f7f7f7]"}`}><LayoutGrid className="h-4 w-4" /></button></div></div>
            <div className="mb-3 flex flex-wrap gap-5 border-b border-[#f0f1f3] px-2 text-[11px] font-semibold text-[#6b7280]">{["All Orders", "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"].map((status) => <button key={status} type="button" onClick={() => setActiveStatus(status)} className={`pb-2 ${activeStatus === status ? "border-b-2 border-[#ff6b22] text-[#ff6b22]" : ""}`}>{status}</button>)}</div>
            <div className="overflow-x-auto"><table className="min-w-full text-left text-[11px]"><thead><tr className="bg-[#fff4ed] font-semibold text-[#374151]"><th className="rounded-tl-md px-2 py-3">Order ID</th><th className="px-2 py-3">Customer</th><th className="px-2 py-3">Items</th><th className="px-2 py-3">Order Date</th><th className="px-2 py-3">Amount</th><th className="px-2 py-3">Status</th><th className="rounded-tr-md px-2 py-3">Action</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} className={`border-b border-[#f0f1f3] ${selectedOrder.id === order.id ? "bg-[#fffaf7]" : ""}`}><td className="px-2 py-3 font-semibold text-[#ed5d19]">{order.id}<div className="font-normal text-[#6b7280]">#{order.id.slice(-3)}</div></td><td className="px-2 py-3 font-medium">{order.customer}<div className="text-[#6b7280]">{order.phone}</div></td><td className="px-2 py-3">{order.items} Items</td><td className="px-2 py-3">{order.date}<div className="text-[#6b7280]">{order.time}</div></td><td className="px-2 py-3 font-medium">{formatCurrency(order.amount)}</td><td className="px-2 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass[order.status]}`}>{order.status}</span></td><td className="px-2 py-3"><button type="button" onClick={() => setSelectedOrder(order)} className="rounded-md border border-[#ff9869] px-2 py-1 text-[10px] font-semibold text-[#ed6b26]">Show</button></td></tr>)}</tbody></table></div>
            <div className="card-mode-only hidden grid-cols-1 gap-3 p-1 sm:grid-cols-2 xl:grid-cols-3">{filteredOrders.map((order) => <article key={order.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#1f2937]">{order.id}</h2><p className="mt-1 text-xs text-[#6b7280]">{order.date} · {order.time}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass[order.status]}`}>{order.status}</span></div><div className="mt-4 space-y-2 text-xs"><p><span className="text-[#6b7280]">Customer:</span> {order.customer}</p><p><span className="text-[#6b7280]">Phone:</span> {order.phone || "-"}</p><p><span className="text-[#6b7280]">Items:</span> {order.items}</p><p className="text-base font-bold text-[#ed5d19]">{formatCurrency(order.amount)}</p></div><button type="button" onClick={() => setSelectedOrder(order)} className="mt-4 w-full rounded-md border border-[#ff9869] px-3 py-2 text-xs font-semibold text-[#ed6b26]">Select Order</button></article>)}{!filteredOrders.length && <p className="col-span-full py-8 text-center text-xs text-[#6b7280]">No orders found.</p>}</div>
            <div className="mt-3 text-[11px] text-[#6b7280]">Showing 1 to {filteredOrders.length} of {orders.length} orders</div>
          </section>

         
        </div>
      </div>
    </div>
  );
};

export default Billing;

import { useMemo, useState } from "react";
import { Check, ChevronDown, Edit3, Printer, Search, ShoppingBag, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const orders = [
  { id: "ORD-000124", customer: "Karthik R", phone: "+91 9876543210", items: 3, date: "02 May 2025", time: "11:30 AM", amount: 1299, status: "Confirmed" },
  { id: "ORD-000123", customer: "Priya Sharma", phone: "+91 9123456780", items: 2, date: "02 May 2025", time: "10:15 AM", amount: 2499, status: "Confirmed" },
  { id: "ORD-000122", customer: "Arun Kumar", phone: "+91 9988776655", items: 4, date: "01 May 2025", time: "06:45 PM", amount: 3599, status: "Preparing" },
  { id: "ORD-000121", customer: "Meena Devi", phone: "+91 9090909090", items: 1, date: "01 May 2025", time: "04:20 PM", amount: 799, status: "Ready" },
  { id: "ORD-000120", customer: "Suresh Babu", phone: "+91 9012345678", items: 2, date: "01 May 2025", time: "02:10 PM", amount: 1199, status: "Completed" },
  { id: "ORD-000119", customer: "Deepak Raj", phone: "+91 9871236540", items: 3, date: "30 Apr 2025", time: "07:30 PM", amount: 2699, status: "Completed" },
  { id: "ORD-000118", customer: "Nandhini K", phone: "+91 9455566778", items: 1, date: "30 Apr 2025", time: "05:15 PM", amount: 599, status: "Cancelled" },
  { id: "ORD-000117", customer: "Vignesh V", phone: "+91 9600123456", items: 2, date: "29 Apr 2025", time: "11:00 AM", amount: 1499, status: "Confirmed" },
];

const products = [
  { name: "Family Photo Frame", detail: "12 x 18 Inch", price: 599, quantity: 1 },
  { name: "Premium Wedding Album", detail: "12 x 18 Inch, 40 Pages", price: 999, quantity: 1 },
  { name: "Birthday Photo Mug", detail: "White Ceramic", price: 299, quantity: 1 },
];

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
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [activeStatus, setActiveStatus] = useState("All Orders");
  const [receivedAmount, setReceivedAmount] = useState("1300");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || `${order.id} ${order.customer} ${order.phone}`.toLowerCase().includes(query);
    const matchesStatus = activeStatus === "All Orders" || order.status === activeStatus;
    return matchesSearch && matchesStatus;
  }), [search, activeStatus]);

  const subtotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const discount = 598;
  const total = subtotal - discount;
  const change = Math.max(Number(receivedAmount || 0) - total, 0);

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 text-[#1f2937] md:p-6">
      <div className="mx-auto max-w-[1500px]">
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

        <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-3">
            <div className="mb-3 flex flex-col gap-2 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by Order ID / Customer / Mobile..." className="h-10 w-full rounded-md border border-[#e5e7eb] pl-9 pr-3 text-xs outline-none focus:border-[#ff8a4c]" /></div><label className="relative"><select value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#e5e7eb] bg-white px-3 pr-8 text-xs outline-none"><option>All Orders</option><option>Confirmed</option><option>Preparing</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" /></label></div>
            <div className="mb-3 flex flex-wrap gap-5 border-b border-[#f0f1f3] px-2 text-[11px] font-semibold text-[#6b7280]">{["All Orders", "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"].map((status) => <button key={status} type="button" onClick={() => setActiveStatus(status)} className={`pb-2 ${activeStatus === status ? "border-b-2 border-[#ff6b22] text-[#ff6b22]" : ""}`}>{status}</button>)}</div>
            <div className="overflow-x-auto"><table className="min-w-full text-left text-[11px]"><thead><tr className="bg-[#fff4ed] font-semibold text-[#374151]"><th className="rounded-tl-md px-2 py-3">Order ID</th><th className="px-2 py-3">Customer</th><th className="px-2 py-3">Items</th><th className="px-2 py-3">Order Date</th><th className="px-2 py-3">Amount</th><th className="px-2 py-3">Status</th><th className="rounded-tr-md px-2 py-3">Action</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} className={`border-b border-[#f0f1f3] ${selectedOrder.id === order.id ? "bg-[#fffaf7]" : ""}`}><td className="px-2 py-3 font-semibold text-[#ed5d19]">{order.id}<div className="font-normal text-[#6b7280]">#{order.id.slice(-3)}</div></td><td className="px-2 py-3 font-medium">{order.customer}<div className="text-[#6b7280]">{order.phone}</div></td><td className="px-2 py-3">{order.items} Items</td><td className="px-2 py-3">{order.date}<div className="text-[#6b7280]">{order.time}</div></td><td className="px-2 py-3 font-medium">{formatCurrency(order.amount)}</td><td className="px-2 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass[order.status]}`}>{order.status}</span></td><td className="px-2 py-3"><button type="button" onClick={() => setSelectedOrder(order)} className="rounded-md border border-[#ff9869] px-2 py-1 text-[10px] font-semibold text-[#ed6b26]">Show</button></td></tr>)}</tbody></table></div>
            <div className="mt-3 text-[11px] text-[#6b7280]">Showing 1 to {filteredOrders.length} of {orders.length} orders</div>
          </section>

          <section className="space-y-3"><div className="rounded-lg border border-[#e5e7eb] bg-white p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Customer Details</h2><button type="button" className="inline-flex items-center gap-1 rounded-md border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold"><Edit3 className="h-3 w-3" /> Edit</button></div><div className="grid grid-cols-2 gap-3 text-[11px]"><div><p className="font-semibold">Name</p><p className="mt-1 text-[#374151]">{selectedOrder.customer}</p></div><div><p className="font-semibold">Email</p><p className="mt-1 text-[#374151]">{selectedOrder.customer.toLowerCase().replace(" ", "")}@gmail.com</p></div><div><p className="font-semibold">Phone</p><p className="mt-1 text-[#374151]">{selectedOrder.phone}</p></div><div><p className="font-semibold">Address</p><p className="mt-1 text-[#374151]">No. 45, Anna Nagar, Chennai,<br />Tamil Nadu - 600040</p></div></div></div>
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4"><h2 className="mb-3 text-sm font-bold">Order Items</h2><div className="grid grid-cols-[1fr_60px_35px_70px] border-b border-[#f0f1f3] pb-2 text-[10px] font-semibold text-[#6b7280]"><span>Item</span><span>Price</span><span>Qty</span><span className="text-right">Total</span></div>{products.map((product) => <div key={product.name} className="grid grid-cols-[1fr_60px_35px_70px] items-center border-b border-[#f0f1f3] py-3 text-[10px]"><div><p className="font-semibold">{product.name}</p><p className="text-[#6b7280]">{product.detail}</p></div><span>{formatCurrency(product.price)}</span><span>{product.quantity}</span><span className="text-right font-semibold">{formatCurrency(product.price * product.quantity)}</span></div>)}<div className="ml-auto mt-3 max-w-[220px] space-y-1 text-right text-[11px]"><p>Subtotal <b>{formatCurrency(subtotal)}</b></p><p>Discount <b className="text-[#198754]">- {formatCurrency(discount)}</b></p><p>Tax (18%) <b>{formatCurrency(0)}</b></p><p className="border-t border-[#e5e7eb] pt-2 text-sm font-bold">Total Amount <strong className="ml-4 text-[#ed5d19]">{formatCurrency(total)}</strong></p></div></div>
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4"><h2 className="mb-3 text-sm font-bold">Payment Method</h2><div className="grid gap-3 md:grid-cols-3"><label className="text-[10px] font-semibold">Payment Method<select className="mt-1 h-9 w-full rounded-md border border-[#e5e7eb] px-2 text-xs font-normal"><option>Cash</option><option>UPI</option><option>Card</option></select></label><label className="text-[10px] font-semibold">Received Amount (₹)<input value={receivedAmount} onChange={(event) => setReceivedAmount(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#e5e7eb] px-2 text-xs font-normal" /></label><div className="text-[10px] font-semibold">Change (₹)<div className="mt-1 flex h-9 items-center rounded-md bg-[#e8f7ed] px-2 text-xs text-[#198754]">{change.toFixed(2)}</div></div></div><div className="mt-4 flex flex-wrap justify-end gap-3"><button type="button" className="rounded-md border border-[#e5e7eb] px-5 py-2 text-xs font-semibold">Cancel</button><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-[#ff9869] px-5 py-2 text-xs font-semibold text-[#ed6b26]"><Printer className="h-4 w-4" /> Print Preview</button><button type="button" className="inline-flex items-center gap-2 rounded-md bg-[#f56618] px-5 py-2 text-xs font-semibold text-white"><Printer className="h-4 w-4" /> Generate Bill</button></div></div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Billing;

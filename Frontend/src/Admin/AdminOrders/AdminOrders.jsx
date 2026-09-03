import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  X,
  XCircle,
  Sparkles
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

const orderStatuses = [
  { id: "NEW", name: "New Order" },
  { id: "ORDER_PLACED", name: "Order Placed" },
  { id: "CONFIRMED", name: "Confirmed" },
  { id: "PROCESSING", name: "Processing" },
  { id: "PACKING", name: "Packing" },
  { id: "READY", name: "Ready" },
  { id: "SHIPPED", name: "Shipped" },
  { id: "OUT_FOR_DELIVERY", name: "Out for Delivery" },
  { id: "DELIVERED", name: "Delivered" },
  { id: "CANCELLED", name: "Cancelled" },
  { id: "ON_HOLD", name: "On Hold" },
  { id: "RETURNED", name: "Returned" },
];

const statusAliases = {
  "NEW ORDER": "NEW",
  PENDING: "NEW",
  "ORDER PLACED": "ORDER_PLACED",
  ORDER_PLACED: "ORDER_PLACED",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  PACKING: "PACKING",
  READY: "READY",
  "OUT FOR DELIVERY": "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  "ON HOLD": "ON_HOLD",
  ON_HOLD: "ON_HOLD",
  RETURNED: "RETURNED",
};

const normalizeStatus = (status) =>
  statusAliases[String(status || "").trim().toUpperCase()] || status;

const statusName = (status) =>
  orderStatuses.find((option) => option.id === normalizeStatus(status))?.name || status;

const getStatusOptions = (currentStatus) => {
  const normalizedStatus = normalizeStatus(currentStatus);
  const workflowIndex = orderStatuses.findIndex((option) => option.id === normalizedStatus);
  const workflowOptions = workflowIndex >= 0 ? orderStatuses.slice(workflowIndex) : [];
  const currentOption = workflowOptions.length
    ? workflowOptions
    : [{ id: normalizedStatus, name: statusName(currentStatus) }];
  const specialOptions = orderStatuses.filter((option) =>
    ["CANCELLED", "ON_HOLD", "RETURNED"].includes(option.id)
  );

  return [...currentOption, ...specialOptions.filter(
    (option) => !currentOption.some((current) => current.id === option.id)
  )];
};

const AdminOrders = ({ defaultStatus = "All", allowedStatuses = null, showNewOrderButton = false, todayOnly = false, readOnlyStatus = false }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(defaultStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [statusDraft, setStatusDraft] = useState("");
  const [shippingDetails, setShippingDetails] = useState({
    shipped_at: "",
    docket_number: "",
    courier_name: "",
  });
  const [statusPopupOrderId, setStatusPopupOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (todayOnly) {
        params.today = "1";
      } else {
        params.billing_type = "Online Order";
      }

      const res = await api.get("/orders", { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const nextOrders = res.data.data.filter((order) => {
          const normalizedStatus = String(order.order_status || "").toLowerCase();
          if (todayOnly && ["completed", "delivered", "cancelled"].includes(normalizedStatus)) return false;
          if (
            allowedStatuses &&
            !allowedStatuses.some(
              (status) => status.toLowerCase() === normalizedStatus
            )
          ) return false;
          return activeStatus === "All" || normalizeStatus(order.order_status) === normalizeStatus(activeStatus);
        });
        setOrders(nextOrders);
        setCurrentPage(1);
      } else {
        setOrders([]);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load orders");
      setOrders([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus, allowedStatuses, todayOnly]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleViewOrder = async (orderId) => {
    if (todayOnly) {
      navigate(`/admin/orders/new/${orderId}`);
      return;
    }

    try {
      setLoadingDetails(true);
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.success && res.data.data) {
        setSelectedOrder(res.data.data);
        setStatusDraft(normalizeStatus(res.data.data.order_status || "Pending"));
        setCancellationReason(res.data.data.notes || "");
        setShippingDetails({
          shipped_at: res.data.data.shipped_at
            ? new Date(res.data.data.shipped_at).toISOString().slice(0, 16)
            : "",
          docket_number: res.data.data.docket_number || "",
          courier_name: res.data.data.courier_name || "",
        });
      } else {
        toast.error("Could not load order details");
      }
    } catch (err) {
      console.error("View order error:", err);
      toast.error("Failed to load order details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, details = shippingDetails) => {
    if ((newStatus === "Cancelled" || newStatus === "CANCELLED") && !cancellationReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${orderId}/status`, {
        order_status: newStatus,
        ...details,
        notes: cancellationReason.trim(),
      });

      if (res.data?.success) {
        toast.success(`Order status updated to ${statusName(newStatus)}`);
        if (selectedOrder) {
          setSelectedOrder((prev) => ({ ...prev, order_status: newStatus, notes: cancellationReason.trim() }));
        }
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === orderId ? { ...o, order_status: newStatus } : o
          )
        );
        setStatusPopupOrderId(null);
        setStatusDraft("");
        setStatusPopupOrderId(null);
      }
    } catch (err) {
      console.error("Update status error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?`)) return;

    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data?.success) {
        toast.success("Order deleted successfully");
        if (selectedOrder?.order_id === orderId) {
          setSelectedOrder(null);
        }
        fetchOrders();
      }
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error("Failed to delete order");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-[#fff8eb] text-[#b07838] border-[#eedac3]";
      case "Processing":
      case "PACKING":
        return "bg-[#eef2ff] text-[#4f46e5] border-[#c7d2fe]";
      case "SHIPPED":
      case "Packing":
        return "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]";
      case "Shipped":
        return "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]";
      case "Delivered":
        return "bg-[#e8f6ed] text-[#1b794b] border-[#a3e6be]";
      case "Cancelled":
        return "bg-[#fff1f1] text-[#dc2626] border-[#fecaca]";
      default:
        return "bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]";
    }
  };

  const statusOptions = allowedStatuses
    ? ["All", ...allowedStatuses]
    : ["All", "Pending", "Processing", "Packing", "Shipped", "Delivered", "Cancelled"];

  // Metrics
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.order_status === "Pending").length;
  const processingCount = orders.filter((o) => o.order_status === "Processing").length;
  const deliveredCount = orders.filter((o) => o.order_status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const metricCards = [
    {
      title: "Total Orders",
      value: totalOrdersCount.toLocaleString(),
      change: "18.6%",
      icon: ShoppingCart,
      color: "#22c55e",
      wave: "#9be7b9",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: "22.4%",
      icon: IndianRupee,
      color: "#f59e0b",
      wave: "#f9d99b",
    },
    {
      title: "Pending Orders",
      value: pendingCount.toLocaleString(),
      change: "15.3%",
      icon: Clock,
      color: "#06b6d4",
      wave: "#93dce8",
    },
    {
      title: "Delivered Orders",
      value: deliveredCount.toLocaleString(),
      change: "10.7%",
      icon: CheckCircle,
      color: "#a855f7",
      wave: "#d8b4f5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-4 md:p-2">
      <style>{`@keyframes status-popup-in { from { opacity: 0; transform: scale(.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } } .status-popup-card { animation: status-popup-in 180ms ease-out; }`}</style>
      <div className="mx-auto max-w-7xl">
     

        {/* METRICS ROW */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="relative flex min-h-[176px] flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-1 items-start gap-4">
                  <div
                    className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: card.color }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium text-[#374151]">{card.title}</p>
                    <p className="mt-2 truncate text-[1.75rem] font-bold leading-none text-[#111827]">
                      {card.value}
                    </p>
                    <p className="mt-5 text-xs font-medium text-[#00a76f]">↗ {card.change}</p>
                    <p className="mt-1 text-[11px] text-[#7c8798]">from last month</p>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 h-6 w-full"
                  style={{
                    background: card.wave,
                    clipPath: "ellipse(65% 75% at 55% 100%)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#e8dfd2] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          {/* SEARCH */}
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, Name, Phone..."
              className="h-10 w-full rounded-xl border border-[#d8cfc3] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#b07838]"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#999]" />
          </form>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
            <div className="flex items-center gap-2">
                
                <select value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)} className="h-10 rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs font-bold text-[#1a3c36] outline-none focus:border-[#b07838]" aria-label="Filter orders by status">
                  <option value="All">All Statuses</option>
                  {orderStatuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
                </select>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#d8cfc3] bg-[#faf8f4] p-1">
            <button type="button" onClick={() => setViewMode("card")} className={`inline-flex h-8 w-9 items-center justify-center rounded-lg text-xs font-bold ${viewMode === "card" ? "bg-[#1a3c36] text-white" : "text-[#66736e] hover:bg-white"}`} aria-pressed={viewMode === "card"} aria-label="Card view" title="Card view">
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => setViewMode("table")} className={`inline-flex h-8 w-9 items-center justify-center rounded-lg text-xs font-bold ${viewMode === "table" ? "bg-[#1a3c36] text-white" : "text-[#66736e] hover:bg-white"}`} aria-pressed={viewMode === "table"} aria-label="Table view" title="Table view">
              <List className="h-3.5 w-3.5" />
            </button>
            </div>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="overflow-hidden rounded-3xl border border-[#e8dfd2] bg-white shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
              <p className="mt-2 text-xs font-semibold text-[#777]">Loading customer orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#777]">
              <Package className="mx-auto h-12 w-12 text-[#ccc]" />
              <p className="mt-3 font-semibold text-[#444]">No orders found.</p>
              <p className="text-xs text-[#888]">When customers buy frames, orders appear here with customized photos.</p>
            </div>
          ) : (
            <>
              {viewMode === "card" && (
                <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedOrders.map((order) => (
                    <article key={order.id} className="rounded-2xl border border-[#e8dfd2] bg-[#fffdfa] p-4 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs font-bold text-[#1a3c36]">{order.order_id}</p>
                          <p className="mt-1 text-[11px] text-[#777]">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "--"}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(order.order_status)}`}>{statusName(order.order_status)}</span>
                      </div>
                      <div className="mt-4 space-y-2 text-xs">
                        <p className="font-bold text-[#1d2925]">{order.customer_name || "--"}</p>
                        <p className="flex items-center gap-1 text-[#777]"><Phone className="h-3 w-3" /> {order.customer_phone || "--"}</p>
                        <p className="text-[#555]"><span className="font-semibold">{order.item_count || 1} item{order.item_count !== 1 ? "s" : ""}</span> · {order.product_names || "Custom Frame"}</p>
                        <p className="text-base font-black text-[#1a3c36]">₹{order.total_amount}</p>
                        <p className="text-[#777]">{order.payment_method || "--"} · {order.payment_status || "--"}</p>
                      </div>
                      <div className="mt-4 flex justify-end gap-2 border-t border-[#f0e8dc] pt-3">
                        <button type="button" onClick={() => handleViewOrder(order.order_id)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d8cfc3] bg-white px-2.5 text-xs font-bold text-[#1a3c36] hover:bg-[#eef5f3]"><Eye className="h-3.5 w-3.5" /> View</button>
                        <button type="button" onClick={() => handleDeleteOrder(order.order_id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f2dada] bg-[#fff5f5] text-[#d04d4d] hover:bg-[#ffe5e5]" title="Delete Order"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className={viewMode === "card" ? "hidden" : "overflow-x-auto"}>
                <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0e8dc] bg-[#faf8f4] font-bold text-[#555]">
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Items</th>
                    <th className="px-4 py-3.5">Total</th>
                    <th className="px-4 py-3.5">Payment</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebdF]">
                  {paginatedOrders.map((order) => {
                    const dateStr = order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "--";

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-[#fbf9f6] text-[#333]"
                      >
                        <td className="px-4 py-4 font-mono font-bold text-[#1a3c36]">
                          {order.order_id}
                        </td>
                        <td className="px-4 py-4 text-[#777] whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#1d2925]">{order.customer_name}</div>
                          <div className="text-[11px] text-[#777] flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {order.customer_phone}
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px] truncate text-[#555]">
                          <span className="font-semibold text-[#333]">
                            {order.item_count || 1} item{order.item_count !== 1 ? "s" : ""}
                          </span>
                          <span className="block text-[11px] text-[#888] truncate">
                            {order.product_names || "Custom Frame"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-[#1a3c36]">
                          ₹{order.total_amount}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] font-semibold text-[#444]">
                            {order.payment_method}
                          </span>
                          <span className="block text-[10px] text-[#888]">
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative inline-block">
                            {readOnlyStatus ? (
                              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(order.order_status)}`}>
                                {statusName(order.order_status)}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusPopupOrderId((current) => current === order.order_id ? null : order.order_id);
                                  setStatusDraft(normalizeStatus(order.order_status));
                                  setCancellationReason(order.notes || "");
                                }}
                                className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(order.order_status)}`}
                                title="Click to update order status"
                              >
                                {statusName(order.order_status)}
                              </button>
                            )}
                            {!readOnlyStatus && statusPopupOrderId === order.order_id && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
                                role="dialog"
                                aria-modal="true"
                                aria-label={`Update status for ${order.order_id}`}
                                onMouseDown={(event) => event.target === event.currentTarget && setStatusPopupOrderId(null)}
                              >
                                <div className="status-popup-card w-full max-w-sm rounded-2xl border border-[#e5e7eb] bg-white p-5 text-left shadow-2xl">
                                  <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#6b7280]">Update Status</p>
                                      <h3 className="mt-1 text-base font-bold text-[#1a3c36]">{order.order_id}</h3>
                                    </div>
                                    <button type="button" onClick={() => setStatusPopupOrderId(null)} className="rounded-md bg-[#1a3c36] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#235048]">Close</button>
                                  </div>
                                  <select
                                    value={statusDraft}
                                    onChange={(event) => {
                                      setStatusDraft(event.target.value);
                                      if (event.target.value !== "Cancelled" && event.target.value !== "CANCELLED") {
                                        setCancellationReason("");
                                      }
                                    }}
                                    disabled={updatingStatus}
                                    className="h-10 w-full rounded-md border border-[#d8cfc3] bg-white px-3 text-xs font-semibold text-[#1a3c36] outline-none focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                                  >
                                    {getStatusOptions(order.order_status).map((status) => (
                                      <option key={status.id} value={status.id}>{status.name}</option>
                                    ))}
                                    {!getStatusOptions(order.order_status).some((status) => status.id === normalizeStatus(order.order_status)) && (
                                      <option value={normalizeStatus(order.order_status)}>{statusName(order.order_status)}</option>
                                    )}
                                  </select>
                                  {(statusDraft === "Shipped" || statusDraft === "SHIPPED") && (
                                    <div className="mt-3 space-y-2">
                                      <input type="datetime-local" value={shippingDetails.shipped_at} onChange={(event) => setShippingDetails((prev) => ({ ...prev, shipped_at: event.target.value }))} className="h-9 w-full rounded-md border border-[#d8cfc3] px-2 text-xs outline-none focus:border-[#1a3c36]" aria-label="Shipped date and time" />
                                      <input value={shippingDetails.docket_number} onChange={(event) => setShippingDetails((prev) => ({ ...prev, docket_number: event.target.value }))} placeholder="Docket number" className="h-9 w-full rounded-md border border-[#d8cfc3] px-2 text-xs outline-none focus:border-[#1a3c36]" />
                                      <input value={shippingDetails.courier_name} onChange={(event) => setShippingDetails((prev) => ({ ...prev, courier_name: event.target.value }))} placeholder="Courier name" className="h-9 w-full rounded-md border border-[#d8cfc3] px-2 text-xs outline-none focus:border-[#1a3c36]" />
                                    </div>
                                  )}
                                  {(statusDraft === "Cancelled" || statusDraft === "CANCELLED") && (
                                    <textarea
                                      value={cancellationReason}
                                      onChange={(event) => setCancellationReason(event.target.value)}
                                      placeholder="Enter cancellation reason"
                                      rows={3}
                                      required
                                      className="mt-3 w-full rounded-md border border-[#d8cfc3] px-2 py-2 text-xs outline-none focus:border-[#1a3c36]"
                                      aria-label="Cancellation reason"
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(order.order_id, statusDraft, shippingDetails)}
                                    disabled={updatingStatus || !statusDraft || statusDraft === normalizeStatus(order.order_status) || ((statusDraft === "Cancelled" || statusDraft === "CANCELLED") && !cancellationReason.trim())}
                                    className="mt-3 w-full rounded-md bg-[#1a3c36] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#235048] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {updatingStatus ? "Updating..." : "Update Status"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewOrder(order.order_id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d8cfc3] bg-white px-2.5 text-xs font-bold text-[#1a3c36] shadow-2xs hover:bg-[#eef5f3]"
                              title="View Order Details and Customized Photos"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.order_id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f2dada] bg-[#fff5f5] text-[#d04d4d] hover:bg-[#ffe5e5]"
                              title="Delete Order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
              <div className={viewMode === "card" ? "hidden" : "flex flex-col gap-3 border-t border-[#f0e8dc] px-4 py-3 text-xs text-[#777] sm:flex-row sm:items-center sm:justify-between"}>
              <span>
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, orders.length)} of {orders.length} orders
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#1a3c36] transition hover:bg-[#eef5f3] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Previous page"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-16 text-center font-semibold text-[#444]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#1a3c36] transition hover:bg-[#eef5f3] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Next page"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= ORDER DETAILS & CUSTOMIZED PHOTOS INSPECTOR MODAL ================= */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-2xl">
            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4eee6] text-[#555] hover:bg-[#e7dfd4]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* MODAL HEADER */}
            <div className="border-b border-[#f0e8dc] pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#1a3c36] px-3 py-1 text-xs font-mono font-bold text-white">
                  {selectedOrder.order_id}
                </span>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadge(
                    selectedOrder.order_status
                  )}`}
                >
                  {selectedOrder.order_status}
                </span>
                <span className="text-xs text-[#777]">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-[#1d2925]">
                  Order Details &amp; Customer Frame Photos
                </h2>

                {/* STATUS CHANGER */}
                {!readOnlyStatus && <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#666]">Change Status:</label>
                  <select
                    value={statusDraft || selectedOrder.order_status}
                    onChange={(e) => {
                      setStatusDraft(e.target.value);
                      if (e.target.value !== "Cancelled" && e.target.value !== "CANCELLED") {
                        setCancellationReason("");
                      }
                    }}
                    disabled={updatingStatus}
                    className="h-9 rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs font-bold text-[#1a3c36] outline-none focus:border-[#1a3c36]"
                  >
                    {getStatusOptions(selectedOrder.order_status).map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                    {!getStatusOptions(selectedOrder.order_status).some((status) => status.id === normalizeStatus(selectedOrder.order_status)) && (
                      <option value={normalizeStatus(selectedOrder.order_status)}>{statusName(selectedOrder.order_status)}</option>
                    )}
                  </select>
                  {(statusDraft === "Shipped" || statusDraft === "SHIPPED") && (
                    <div className="mt-3 grid w-full gap-2 sm:grid-cols-3">
                      <input type="datetime-local" value={shippingDetails.shipped_at} onChange={(e) => setShippingDetails((prev) => ({ ...prev, shipped_at: e.target.value }))} className="h-9 rounded-md border border-[#d8cfc3] px-2 text-xs outline-none focus:border-[#1a3c36]" aria-label="Shipped date and time" />
                      <input value={shippingDetails.docket_number} onChange={(e) => setShippingDetails((prev) => ({ ...prev, docket_number: e.target.value }))} placeholder="Docket number" className="h-9 rounded-md border border-[#d8cfc3] px-2 text-xs outline-none focus:border-[#1a3c36]" />
                      <input value={shippingDetails.courier_name} onChange={(e) => setShippingDetails((prev) => ({ ...prev, courier_name: e.target.value }))} placeholder="Courier name" className="h-9 rounded-md border border-[#d8cfc3] px-2 text-xs outline-none focus:border-[#1a3c36]" />
                      <button type="button" onClick={() => handleStatusChange(selectedOrder.order_id, statusDraft, shippingDetails)} disabled={updatingStatus || statusDraft === selectedOrder.order_status} className="rounded-md bg-[#1a3c36] px-3 py-2 text-xs font-bold text-white hover:bg-[#235048] disabled:opacity-50 sm:col-span-3">{updatingStatus ? "Updating..." : "Update Shipped Status"}</button>
                    </div>
                  )}
                  {(statusDraft === "Cancelled" || statusDraft === "CANCELLED") && (
                    <div className="mt-3 w-full">
                      <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Enter cancellation reason"
                        rows={3}
                        required
                        className="w-full rounded-md border border-[#d8cfc3] px-2 py-2 text-xs outline-none focus:border-[#1a3c36]"
                        aria-label="Cancellation reason"
                      />
                      <button type="button" onClick={() => handleStatusChange(selectedOrder.order_id, statusDraft)} disabled={updatingStatus || !cancellationReason.trim()} className="mt-2 rounded-md bg-[#1a3c36] px-3 py-2 text-xs font-bold text-white hover:bg-[#235048] disabled:opacity-50">{updatingStatus ? "Updating..." : "Update Cancelled Status"}</button>
                    </div>
                  )}
                  {statusDraft !== "Shipped" && statusDraft !== "SHIPPED" && statusDraft !== selectedOrder.order_status && (
                    statusDraft !== "Cancelled" && statusDraft !== "CANCELLED" &&
                    <button type="button" onClick={() => handleStatusChange(selectedOrder.order_id, statusDraft)} disabled={updatingStatus} className="rounded-md bg-[#1a3c36] px-3 py-2 text-xs font-bold text-white hover:bg-[#235048] disabled:opacity-50">Update</button>
                  )}
                </div>}
              </div>
            </div>

            {/* CUSTOMER & SHIPPING INFO GRID */}
            <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4 text-xs sm:grid-cols-3">
              <div>
                <p className="font-bold uppercase tracking-wider text-[#b07838] flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Customer Details
                </p>
                <p className="mt-1.5 font-bold text-[#222]">{selectedOrder.customer_name}</p>
                <p className="text-[#666]">{selectedOrder.customer_phone}</p>
                <p className="text-[#666] truncate">{selectedOrder.customer_email || "No email"}</p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-[#b07838] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Shipping Address
                </p>
                <p className="mt-1.5 text-[#333] whitespace-pre-line">{selectedOrder.shipping_address}</p>
                <p className="text-[#666]">
                  {[selectedOrder.city, selectedOrder.state, selectedOrder.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-[#b07838] flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> Payment &amp; Total
                </p>
                <p className="mt-1.5 text-[#333]">
                  Method: <strong className="text-[#1a3c36]">{selectedOrder.payment_method}</strong>
                </p>
                <p className="text-[#666]">Status: {selectedOrder.payment_status}</p>
                <p className="mt-1 text-sm font-black text-[#1a3c36]">
                  Total: ₹{selectedOrder.total_amount}
                </p>
              </div>
            </div>

            {/* ORDER ITEMS & CUSTOMIZED PHOTOS INSPECTION */}
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d2925]">
                Ordered Items ({selectedOrder.items?.length || 0})
              </h3>

              <div className="mt-3 space-y-6">
                {(selectedOrder.items || []).map((item, idx) => {
                  const customPhotos = item.slot_photos || {};
                  const slotEntries = Object.entries(customPhotos);

                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-3xl border border-[#e8dfd2] bg-white p-5 shadow-xs"
                    >
                      {/* ITEM SUMMARY ROW */}
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f0e8dc] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4efe8]">
                            {item.product_image || item.frame_image ? (
                              <img
                                src={item.product_image || item.frame_image}
                                alt={item.product_name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-[#b9aa98]" />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#b07838]">
                              {item.category || "Photo Frame"}
                            </p>
                            <h4 className="text-base font-bold text-[#1d2925]">
                              {item.product_name}
                            </h4>
                            <p className="text-xs text-[#666]">
                              Size: <strong>{item.size || "Standard"}</strong> • Qty: <strong>{item.quantity}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-[#888]">Unit: ₹{item.price}</p>
                          <p className="text-base font-black text-[#1a3c36]">
                            Total: ₹{item.total_price || item.price * item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* 1. WHOLE FRAME PHOTO (MERGED DESIGN) */}
                      {item.whole_frame_image && (
                        <div className="mt-5 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e8dc] pb-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-[#1a3c36] flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-[#b07838]" /> Whole Frame Photo (Merged Customer Frame)
                              </p>
                              <p className="text-[11px] text-[#777]">
                                Complete final composition of the frame with customer's photos placed
                              </p>
                            </div>

                            <a
                              href={item.whole_frame_image}
                              download={`Order-${selectedOrder.order_id}-WholeFrame.jpg`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3c36] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#235048]"
                            >
                              <Download className="h-3.5 w-3.5" /> Download Whole Frame
                            </a>
                          </div>

                          <div className="mt-4 flex justify-center">
                            <div className="relative max-w-sm overflow-hidden rounded-xl border border-[#e8dfd2] bg-white p-2 shadow-md">
                              <img
                                src={item.whole_frame_image}
                                alt="Whole Frame Complete Preview"
                                className="max-h-72 w-auto object-contain rounded-lg"
                              />
                              <div className="mt-2 text-center text-[11px] font-semibold text-[#666]">
                                Final Assembled Frame
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. SEPARATELY UPLOADED CUSTOMER PHOTOS (INDIVIDUAL SLOTS) */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#b07838] flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4" /> Separately Uploaded Photos ({slotEntries.length} Slots)
                          </p>
                          <span className="text-[11px] text-[#777]">
                            Download individual high-resolution files for lab printing
                          </span>
                        </div>

                        {slotEntries.length === 0 ? (
                          <p className="mt-2 rounded-xl bg-[#faf8f5] p-3 text-xs text-[#888]">
                            Customer did not attach individual slot photos for this item (standard frame ordered).
                          </p>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {slotEntries.map(([slotId, photoUrl], pIdx) => {
                              return (
                                <div
                                  key={slotId || pIdx}
                                  className="group relative overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#faf8f5] p-2 transition hover:border-[#d4a553]"
                                >
                                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#eee7de]">
                                    <img
                                      src={photoUrl}
                                      alt={`Slot ${pIdx + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="truncate text-[11px] font-bold text-[#333]">
                                      Position {pIdx + 1}
                                    </span>

                                    <a
                                      href={photoUrl}
                                      download={`Order-${selectedOrder.order_id}-Position-${pIdx + 1}.jpg`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3c36] text-white shadow transition hover:bg-[#235048]"
                                      title="Download individual high-resolution photo"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="mt-6 flex justify-end border-t border-[#f0e8dc] pt-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#235048]"
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

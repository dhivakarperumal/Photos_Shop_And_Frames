import React, { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Image as ImageIcon,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

const AdminOrders = ({ defaultStatus = "All" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(defaultStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeStatus && activeStatus !== "All") {
        params.status = activeStatus;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get("/orders", { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.success && res.data.data) {
        setSelectedOrder(res.data.data);
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${orderId}/status`, {
        order_status: newStatus,
      });

      if (res.data?.success) {
        toast.success(`Order status updated to ${newStatus}`);
        if (selectedOrder) {
          setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
        }
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === orderId ? { ...o, order_status: newStatus } : o
          )
        );
      }
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Failed to update status");
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
        return "bg-[#eef2ff] text-[#4f46e5] border-[#c7d2fe]";
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

  const statusOptions = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  // Metrics
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.order_status === "Pending").length;
  const processingCount = orders.filter((o) => o.order_status === "Processing").length;
  const deliveredCount = orders.filter((o) => o.order_status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f7f5f2] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b07838]">
              <ShoppingCart className="h-3.5 w-3.5" /> Store Management
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1d2925] sm:text-3xl">
              Customer Orders
            </h1>
            <p className="mt-1 text-xs text-[#666]">
              Review orders, inspect customer-customized frame photos, and update delivery statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-[#d8cfc3] bg-white px-4 py-2 text-xs font-bold text-[#444] shadow-xs transition hover:bg-[#faf7f3]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Orders
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e8dfd2] bg-white p-4 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Total Orders</p>
            <p className="mt-1 text-2xl font-black text-[#1d2925]">{totalOrdersCount}</p>
          </div>
          <div className="rounded-2xl border border-[#eedac3] bg-[#fffaf2] p-4 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b07838]">Pending</p>
            <p className="mt-1 text-2xl font-black text-[#b07838]">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-[#c7d2fe] bg-[#f8faff] p-4 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4f46e5]">Processing</p>
            <p className="mt-1 text-2xl font-black text-[#4f46e5]">{processingCount}</p>
          </div>
          <div className="rounded-2xl border border-[#a3e6be] bg-[#f2fbf6] p-4 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1b794b]">Delivered</p>
            <p className="mt-1 text-2xl font-black text-[#1b794b]">{deliveredCount}</p>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#e8dfd2] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          {/* STATUS TABS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveStatus(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeStatus === st
                    ? "bg-[#1a3c36] text-white shadow-xs"
                    : "bg-[#f4efe7] text-[#666] hover:bg-[#eae4d9]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

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
            <div className="overflow-x-auto">
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
                  {orders.map((order) => {
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
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
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
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#666]">Change Status:</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.order_id, e.target.value)
                    }
                    disabled={updatingStatus}
                    className="h-9 rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs font-bold text-[#1a3c36] outline-none focus:border-[#1a3c36]"
                  >
                    {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                      (st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      )
                    )}
                  </select>
                </div>
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

                      {/* CUSTOMIZED PHOTOS GALLERY FOR THIS FRAME */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#1a3c36] flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4" /> Customer Customized Photos ({slotEntries.length})
                          </p>
                          <span className="text-[11px] text-[#777]">
                            Download original files for lab printing
                          </span>
                        </div>

                        {slotEntries.length === 0 ? (
                          <p className="mt-2 rounded-xl bg-[#faf8f5] p-3 text-xs text-[#888]">
                            Customer did not attach individual slot photos for this item (or standard frame ordered).
                          </p>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {slotEntries.map(([slotId, photoUrl], pIdx) => {
                              return (
                                <div
                                  key={slotId || pIdx}
                                  className="group relative overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#faf8f5] p-2"
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
                                      download={`Order-${selectedOrder.order_id}-Slot-${pIdx + 1}.jpg`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3c36] text-white shadow transition hover:bg-[#235048]"
                                      title="Download high-resolution photo"
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

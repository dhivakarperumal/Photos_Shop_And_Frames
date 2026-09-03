import React, { useState } from "react";
import { CheckCircle2, Package, ShoppingBag, Truck, X } from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CheckoutModal = ({
  isOpen,
  onClose,
  items = [],
  user = null,
  clearCartAfterOrder = false,
  onOrderPlaced,
}) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: user?.displayName || user?.name || user?.username || "",
    customer_email: user?.email || "",
    customer_phone: user?.phone || user?.mobile_number || "",
    shipping_address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    payment_method: "Cash On Delivery",
    notes: "",
  });

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.customer_phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!formData.shipping_address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!formData.pincode.trim()) {
      toast.error("Please enter your area pincode");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: user?.user_id || user?.id || localStorage.getItem("frame_shop_guest_id") || null,
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        shipping_address: formData.shipping_address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        total_amount: totalAmount,
        payment_method: formData.payment_method,
        notes: formData.notes.trim() || null,
        clear_cart: clearCartAfterOrder,
        items: items.map((item) => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name || "Photo Frame",
          category: item.category || "Photo Frames",
          size: item.size || item.variant_size || "Standard",
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          total_price: Number(item.price || 0) * Number(item.quantity || 1),
          customization_id: item.customization_id || null,
          slot_photos: item.slot_photos || null,
          product_image: item.product_image || item.product_images?.[0] || null,
          frame_image: item.frame_image || item.frame_data?.frame_image || null,
        })),
      };

      const response = await api.post("/orders", payload);

      if (response.data?.success) {
        setOrderSuccess(response.data.data);
        if (onOrderPlaced) onOrderPlaced(response.data.data);
        toast.success("Order placed successfully!");
      } else {
        toast.error(response.data?.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    setOrderSuccess(null);
    navigate("/shop");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-2xl">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={orderSuccess ? handleFinish : onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4eee6] text-[#555] transition hover:bg-[#e7dfd4]"
        >
          <X className="h-4 w-4" />
        </button>

        {orderSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f6ed] text-[#1b794b]">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <span className="inline-block rounded-full bg-[#f5efe6] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
              Order Confirmed
            </span>

            <h2 className="mt-2 text-2xl font-black text-[#1d2925]">
              Thank you for your order!
            </h2>
            <p className="mt-1 text-sm text-[#666]">
              Your frame order has been placed and forwarded to our studio team.
            </p>

            <div className="mx-auto my-6 max-w-md rounded-2xl border border-[#e8dfd2] bg-[#faf8f5] p-4 text-left text-xs">
              <div className="flex justify-between py-1 border-b border-[#eee7dc]">
                <span className="text-[#777]">Order ID</span>
                <span className="font-mono font-bold text-[#1a3c36]">{orderSuccess.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eee7dc]">
                <span className="text-[#777]">Customer Name</span>
                <span className="font-bold text-[#333]">{orderSuccess.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eee7dc]">
                <span className="text-[#777]">Items</span>
                <span className="font-bold text-[#333]">{orderSuccess.items?.length || items.length} item(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eee7dc]">
                <span className="text-[#777]">Payment Method</span>
                <span className="font-bold text-[#333]">{orderSuccess.payment_method}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold text-[#1a3c36]">
                <span>Total Amount</span>
                <span>₹{orderSuccess.total_amount || totalAmount}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="rounded-xl bg-[#1a3c36] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#235048]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* ================= ORDER FORM ================= */
          <div>
            <div className="border-b border-[#eee5db] pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b07838]">
                <Truck className="h-4 w-4" /> Quick Delivery Checkout
              </div>
              <h2 className="mt-1 text-xl font-bold text-[#1d2925]">
                Shipping &amp; Order Details
              </h2>
            </div>

            {/* ORDER ITEMS SUMMARY */}
            <div className="mt-4 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8b6528]">
                Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const img = item.product_image || item.product_images?.[0] || item.frame_image || item.frame_data?.frame_image;
                  const customPhotos = item.slot_photos || {};
                  const customCount = Object.keys(customPhotos).length;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-[#f0e7dc] bg-white p-2 text-xs"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eee7de]">
                        {img ? (
                          <img src={img} alt={item.product_name} className="h-full w-full object-contain" />
                        ) : (
                          <Package className="h-5 w-5 text-[#aaa]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-[#222]">{item.product_name}</p>
                        <p className="text-[11px] text-[#777]">
                          Size: <span className="font-semibold text-[#444]">{item.size || "Standard"}</span> • Qty: {item.quantity}
                        </p>
                        {customCount > 0 && (
                          <span className="inline-block mt-0.5 rounded bg-[#e8f6ed] px-1.5 py-0.5 text-[9px] font-bold text-[#1b794b]">
                            ✓ {customCount} Custom Photo{customCount !== 1 ? "s" : ""} Attached
                          </span>
                        )}
                      </div>
                      <div className="text-right font-bold text-[#1a3c36]">
                        ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#ebdcc8] pt-2 text-sm font-bold text-[#1d2925]">
                <span>Total Payable:</span>
                <span className="text-lg text-[#1a3c36]">₹{totalAmount}</span>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#444]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="mt-1 h-10 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs outline-none focus:border-[#b07838]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444]">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="mt-1 h-10 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs outline-none focus:border-[#b07838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="mt-1 h-10 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs outline-none focus:border-[#b07838]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444]">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  name="shipping_address"
                  required
                  value={formData.shipping_address}
                  onChange={handleChange}
                  placeholder="Door No., Street, Landmark"
                  className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white p-3 text-xs outline-none focus:border-[#b07838]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#444]">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Coimbatore"
                    className="mt-1 h-10 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs outline-none focus:border-[#b07838]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444]">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className="mt-1 h-10 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs outline-none focus:border-[#b07838]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#444]">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="641001"
                    className="mt-1 h-10 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 text-xs outline-none focus:border-[#b07838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444]">
                  Payment Option
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {["Cash On Delivery", "Online"].map((method) => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                        formData.payment_method === method
                          ? "border-[#1a3c36] bg-[#eef5f3] text-[#1a3c36]"
                          : "border-[#d8cfc3] bg-white text-[#555] hover:bg-[#faf7f3]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method}
                        checked={formData.payment_method === method}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span>{method === "Cash On Delivery" ? "💵 Cash On Delivery" : "💳 Online Payment"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-[#eee5db] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#ddd4c8] px-4 py-2.5 text-xs font-bold text-[#555] transition hover:bg-[#f7f2eb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#235048] disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {submitting ? "Placing Order..." : `Place Order (₹${totalAmount})`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;

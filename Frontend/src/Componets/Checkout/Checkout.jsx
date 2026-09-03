import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import api from "../../api";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import toast from "react-hot-toast";

const indianStates = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Rajasthan",
  "West Bengal",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Bihar",
  "Odisha",
  "Assam",
  "Goa",
  "Other",
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, fetchCart } = useContext(StoreContext);

  // If checkoutItems passed via location.state (e.g. from Buy Now), use that; otherwise use cart
  const directItems = location.state?.checkoutItems;
  const isDirectBuy = Boolean(directItems && directItems.length > 0);
  const checkoutItems = isDirectBuy ? directItems : cart;

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: user?.displayName || user?.name || user?.username || "",
    customer_email: user?.email || "",
    customer_phone: user?.phone || user?.mobile_number || "",
    door_number: user?.door_number || user?.house_number || "",
    street_name: user?.street_name || user?.address_line1 || "",
    landmark: user?.landmark || "",
    city: "",
    district: "",
    state: "Tamil Nadu",
    country: "",
    pincode: "",
    payment_method: "Cash On Delivery",
    notes: "",
  });

  // Autofill user details if user loads after mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user?.displayName || user?.name || user?.username || "",
        customer_email: prev.customer_email || user?.email || "",
        customer_phone: prev.customer_phone || user?.phone || user?.mobile_number || "",
        door_number: prev.door_number || user?.door_number || user?.house_number || "",
        street_name: prev.street_name || user?.street_name || user?.address_line1 || "",
        landmark: prev.landmark || user?.landmark || "",
        city: prev.city || user?.city || "",
        district: prev.district || user?.district || "",
        state: prev.state || user?.state || "Tamil Nadu",
        country: prev.country || user?.country || "",
        pincode: prev.pincode || user?.pincode || user?.postal_code || "",
      }));
    }
  }, [user]);

  const totalAmount = checkoutItems.reduce(
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
    if (!formData.street_name.trim()) {
      toast.error("Please enter your street name");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter your city");
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
          shipping_address: [
            formData.door_number,
            formData.street_name,
            formData.landmark,
          ].filter(Boolean).join(", "),
        city: formData.city.trim(),
          district: formData.district.trim(),
        state: formData.state.trim(),
          country: formData.country.trim(),
        pincode: formData.pincode.trim(),
          address: {
            user_id: user?.user_id || user?.id || localStorage.getItem("frame_shop_guest_id") || null,
            customer_id: user?.user_id || user?.id || localStorage.getItem("frame_shop_guest_id") || null,
            customer_name: formData.customer_name.trim(),
            mobile_number: formData.customer_phone.trim(),
            door_number: formData.door_number.trim(),
            street_name: formData.street_name.trim(),
            landmark: formData.landmark.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            state: formData.state.trim(),
            country: formData.country.trim(),
            pincode: formData.pincode.trim(),
          },
        total_amount: totalAmount,
        payment_method: formData.payment_method,
        notes: formData.notes.trim() || null,
        clear_cart: !isDirectBuy, // only clear cart if checking out cart items
        items: checkoutItems.map((item) => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name || "Photo Frame",
          category: item.category || "Photo Frames",
          size: item.size || item.variant_size || "Standard",
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          total_price: Number(item.price || 0) * Number(item.quantity || 1),
          customization_id: item.customization_id || null,
          slot_photos: item.slot_photos || null,
          photo_adjustments: item.photo_adjustments || null,
          preview_image: item.preview_image || item.product_image || item.product_images?.[0] || null,
          product_image: item.product_image || item.product_images?.[0] || null,
          frame_image: item.frame_image || item.frame_data?.frame_image || null,
        })),
      };

      const response = await api.post("/orders", payload);

      if (response.data?.success) {
        setOrderSuccess(response.data.data);
        if (!isDirectBuy) {
          clearCart();
          await fetchCart();
        }
        toast.success("Order placed successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
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

  // ==========================================
  // 1. SUCCESS VIEW
  // ==========================================
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#f8f5f0] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-[#ebe3d7] bg-white p-6 text-center shadow-lg sm:p-10">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f6ed] text-[#1b794b] shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <span className="inline-block rounded-full bg-[#f5efe6] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
              Order Confirmed
            </span>

            <h1 className="mt-3 text-2xl font-black text-[#1d2925] sm:text-3xl">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-xs text-[#666] sm:text-sm">
              Your personalized photo frame order has been successfully placed. Our crafting team is preparing your order with care.
            </p>

            {/* ORDER RECEIPT CARD */}
            <div className="mx-auto my-8 max-w-md rounded-2xl border border-[#e8dfd2] bg-[#faf8f5] p-5 text-left text-xs">
              <div className="flex justify-between border-b border-[#eee7dc] py-2">
                <span className="text-[#777]">Order Reference</span>
                <span className="font-mono font-bold text-[#1a3c36]">{orderSuccess.order_id}</span>
              </div>
              <div className="flex justify-between border-b border-[#eee7dc] py-2">
                <span className="text-[#777]">Customer Name</span>
                <span className="font-bold text-[#333]">{orderSuccess.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-[#eee7dc] py-2">
                <span className="text-[#777]">Contact Phone</span>
                <span className="font-bold text-[#333]">{orderSuccess.customer_phone}</span>
              </div>
              <div className="flex justify-between border-b border-[#eee7dc] py-2">
                <span className="text-[#777]">Delivery Location</span>
                <span className="font-bold text-[#333] text-right">{orderSuccess.city}, {orderSuccess.state} - {orderSuccess.pincode}</span>
              </div>
              <div className="flex justify-between border-b border-[#eee7dc] py-2">
                <span className="text-[#777]">Payment Method</span>
                <span className="font-bold text-[#333]">{orderSuccess.payment_method}</span>
              </div>
              <div className="flex justify-between pt-2.5 text-sm font-bold text-[#1a3c36]">
                <span>Total Amount Paid / COD</span>
                <span className="text-base font-black">₹{orderSuccess.total_amount || totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-8 py-3 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 2. EMPTY STATE VIEW
  // ==========================================
  if (checkoutItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8f5f0] px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-[#e8dfd2] bg-white p-10 shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee5] text-[#b07838]">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#1d2925]">
            No Items to Checkout
          </h2>
          <p className="mt-2 text-xs text-[#777]">
            Your shopping cart is currently empty. Explore our collection to customize photo frames.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Shop
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // 3. MAIN CHECKOUT FORM & SUMMARY VIEW
  // ==========================================
  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#777]">
          <Link to="/" className="hover:text-[#b07838]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#b07838]">Shop</Link>
          <span>/</span>
          <span className="font-semibold text-[#1d2925]">Checkout</span>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-8 border-b border-[#e9dfd2] pb-4">
          <h1 className="text-2xl font-black text-[#1d2925] sm:text-3xl">
            Order Checkout
          </h1>
          <p className="mt-1 text-xs text-[#6b6b63]">
            Complete your delivery details to confirm your frame order.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ================= LEFT COLUMN: DELIVERY & PAYMENT FORM (7 COLS) ================= */}
          <div className="space-y-6 lg:col-span-7">
            {/* CONTACT & SHIPPING DETAILS */}
            <div className="rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-2.5 border-b border-[#f0e8dc] pb-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4eee5] text-[#b07838]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1d2925]">
                    Shipping &amp; Delivery Address
                  </h2>
                  <p className="text-[11px] text-[#777]">
                    Where should we deliver your handcrafted frame?
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* FULL NAME */}
                <div>
                  <label className="mb-1 block font-semibold text-[#444]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                  />
                </div>

                {/* PHONE & EMAIL */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit mobile number"
                      className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      placeholder="ramesh@example.com"
                      className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                    />
                  </div>
                </div>

                {/* CUSTOMER ADDRESS FIELDS */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">Door Number</label>
                    <input type="text" name="door_number" value={formData.door_number} onChange={handleChange} placeholder="e.g. 12A" className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]" />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">Street Name <span className="text-red-500">*</span></label>
                    <input type="text" name="street_name" value={formData.street_name} onChange={handleChange} required placeholder="Street or area name" className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]" />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">Landmark</label>
                    <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Nearby landmark" className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]" />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Chennai"
                      className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">District</label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]" />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]" />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-[#444]">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      placeholder="e.g. 600001"
                      className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                    />
                  </div>
                </div>

                {/* ORDER NOTES */}
                <div>
                  <label className="mb-1 block font-semibold text-[#666]">
                    Special Instructions / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Please deliver after 5 PM, or gift wrap"
                    className="h-10 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 text-xs text-[#222] outline-none transition focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center gap-2.5 border-b border-[#f0e8dc] pb-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5ec] text-[#1b794b]">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1d2925]">
                    Payment Options
                  </h2>
                  <p className="text-[11px] text-[#777]">
                    Choose your preferred payment method
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* CASH ON DELIVERY */}
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    formData.payment_method === "Cash On Delivery"
                      ? "border-[#1a3c36] bg-[#f0f6f3] ring-1 ring-[#1a3c36]"
                      : "border-[#e5dfd4] bg-[#faf8f5] hover:border-[#d4a553]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash On Delivery"
                      checked={formData.payment_method === "Cash On Delivery"}
                      onChange={handleChange}
                      className="accent-[#1a3c36]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1d2925]">Cash on Delivery</p>
                      <p className="text-[10px] text-[#777]">Pay when your frame arrives</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-800">
                    Popular
                  </span>
                </label>

                {/* ONLINE PAYMENT */}
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    formData.payment_method === "Online Payment / UPI"
                      ? "border-[#1a3c36] bg-[#f0f6f3] ring-1 ring-[#1a3c36]"
                      : "border-[#e5dfd4] bg-[#faf8f5] hover:border-[#d4a553]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Online Payment / UPI"
                      checked={formData.payment_method === "Online Payment / UPI"}
                      onChange={handleChange}
                      className="accent-[#1a3c36]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1d2925]">UPI / Net Banking</p>
                      <p className="text-[10px] text-[#777]">GPay, PhonePe, Cards, UPI</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ORDER ITEMS & PRICE SUMMARY (5 COLS) ================= */}
          <div className="space-y-6 lg:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-[#ebdccb] bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center justify-between border-b border-[#f0e8dc] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d2925]">
                  Order Summary ({checkoutItems.length} item{checkoutItems.length !== 1 ? "s" : ""})
                </h3>
                <span className="rounded-full bg-[#f2ecdf] px-2.5 py-0.5 text-[10px] font-bold text-[#666]">
                  {isDirectBuy ? "Direct Buy" : "Cart Items"}
                </span>
              </div>

              {/* ITEMS LIST */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {checkoutItems.map((item, idx) => {
                  const img =
                    item.preview_image ||
                    item.product_images?.[0] ||
                    item.frame_data?.frame_image ||
                    item.frame_image ||
                    item.product_image;

                  const customPhotos = item.slot_photos || {};
                  const customPhotoCount = Object.keys(customPhotos).length;

                  return (
                    <div
                      key={item.id || idx}
                      className="flex gap-3 rounded-2xl border border-[#ede5db] bg-[#faf8f5] p-3 text-xs"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e5ded2] bg-white p-1">
                        {img ? (
                          <img
                            src={img}
                            alt={item.product_name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-[#b9aa98]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-[#222]">
                          {item.product_name}
                        </p>
                        <p className="text-[11px] text-[#777]">
                          Size: <strong className="text-[#444]">{item.size || "Standard"}</strong> • Qty: <strong>{item.quantity || 1}</strong>
                        </p>

                        {customPhotoCount > 0 && (
                          <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#1b794b]">
                            <CheckCircle2 className="h-3 w-3" /> {customPhotoCount} Photo{customPhotoCount !== 1 ? "s" : ""} Attached
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#1a3c36]">
                          ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="mt-5 space-y-2 border-t border-[#f0e8dc] pt-4 text-xs text-[#666]">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#222]">₹{totalAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-[#1b794b]" /> Delivery
                  </span>
                  <span className="font-bold text-[#1b794b]">FREE</span>
                </div>
                <div className="flex justify-between border-t border-[#e8dfd2] pt-2 text-sm font-black text-[#1d2925]">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#1a3c36]">₹{totalAmount}</span>
                </div>
              </div>

              {/* PLACE ORDER BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#235048] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing Your Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-[#d4a553]" />
                    Confirm &amp; Place Order • ₹{totalAmount}
                  </>
                )}
              </button>

              <div className="mt-3 text-center text-[10px] text-[#888] flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1b794b]" />
                100% Secure Checkout &amp; Lab-Quality Printing
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;

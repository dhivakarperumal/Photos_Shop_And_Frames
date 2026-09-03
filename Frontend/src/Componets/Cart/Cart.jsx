import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Package,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import CheckoutModal from "../Checkout/CheckoutModal";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    loadingCart,
    fetchCart,
  } = useContext(StoreContext);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#777]">
          <Link to="/" className="hover:text-[#b07838]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#b07838]">Shop</Link>
          <span>/</span>
          <span className="font-semibold text-[#1d2925]">Shopping Cart</span>
        </div>

        <div className="mb-8 flex items-end justify-between border-b border-[#e9dfd2] pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#1d2925]">
              Your Shopping Cart
            </h1>
            <p className="mt-1 text-xs text-[#6b6b63]">
              Review your customized frames before placing your order.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-[#d04d4d] hover:underline"
            >
              Clear Entire Cart
            </button>
          )}
        </div>

        {loadingCart ? (
          <div className="py-24 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
            <p className="mt-3 text-sm font-semibold text-[#777]">Loading your cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="rounded-3xl border border-[#e8dfd2] bg-white py-20 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee5] text-[#b07838]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#1d2925]">Your Cart is Empty</h2>
            <p className="mt-1 text-xs text-[#777]">
              Explore our frames and customize them with your favourite memories.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#1a3c36] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
            >
              <ArrowLeft className="h-4 w-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* ================= ITEMS LIST (8 COLS) ================= */}
            <div className="space-y-4 lg:col-span-8">
              {cart.map((item) => {
                const img =
                  item.product_images?.[0] ||
                  item.frame_data?.frame_image ||
                  item.frame_image ||
                  item.product_image;

                const customPhotos = item.slot_photos || {};
                const customPhotoEntries = Object.entries(customPhotos);
                const itemSubtotal =
                  Number(item.price || 0) * Number(item.quantity || 1);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-3xl border border-[#e8dfd2] bg-white p-5 shadow-xs transition hover:border-[#d4a553] sm:flex-row sm:items-center"
                  >
                    {/* THUMBNAIL */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f4efe8] p-2">
                      {img ? (
                        <img
                          src={img}
                          alt={item.product_name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-[#b9aa98]" />
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#b07838]">
                            {item.category || "Photo Frame"}
                          </p>
                          <h3 className="text-base font-bold text-[#1d2925]">
                            {item.product_name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] transition hover:bg-[#fff0f0] hover:text-[#d04d4d]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#666]">
                        <span>
                          Size: <strong className="text-[#333]">{item.size || "Standard"}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Unit Price: <strong className="text-[#1a3c36]">₹{item.price}</strong>
                        </span>
                      </div>

                      {/* CUSTOM PHOTOS ATTACHED PREVIEW */}
                      {customPhotoEntries.length > 0 && (
                        <div className="mt-3 rounded-xl border border-[#e6f2ec] bg-[#f7fbf9] p-2.5">
                          <p className="text-[11px] font-bold text-[#1b794b] flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {customPhotoEntries.length} Customized Photo{customPhotoEntries.length !== 1 ? "s" : ""} Attached
                          </p>

                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {customPhotoEntries.map(([slotId, url], i) => (
                              <div
                                key={slotId || i}
                                className="h-9 w-9 overflow-hidden rounded-md border border-[#c2e2d3] bg-white shadow-2xs"
                                title={`Slot Photo ${i + 1}`}
                              >
                                <img
                                  src={url}
                                  alt={`Slot ${i + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* QUANTITY & SUBTOTAL */}
                    <div className="flex items-center justify-between border-t border-[#f0e8dc] pt-3 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end sm:gap-2">
                      <div className="text-right">
                        <span className="text-xs text-[#888] sm:hidden">Total: </span>
                        <span className="text-lg font-black text-[#1a3c36]">
                          ₹{itemSubtotal}
                        </span>
                      </div>

                      <div className="inline-flex items-center rounded-xl border border-[#d8cfc3] bg-[#faf8f5]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center text-xs font-bold text-[#555] hover:bg-white disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[#1d2925]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-xs font-bold text-[#555] hover:bg-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= ORDER SUMMARY (4 COLS) ================= */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#1d2925] border-b border-[#f0e8dc] pb-3">
                  Order Summary
                </h2>

                <div className="mt-4 space-y-2.5 text-xs text-[#555]">
                  <div className="flex justify-between">
                    <span>Items Count</span>
                    <span className="font-semibold text-[#333]">{cart.length} item(s)</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#1d2925]">₹{totalAmount}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-bold text-[#1b794b]">FREE</span>
                  </div>

                  <div className="flex justify-between border-t border-[#f0e8dc] pt-3 text-sm font-bold text-[#1d2925]">
                    <span>Total Amount:</span>
                    <span className="text-lg text-[#1a3c36]">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-md transition hover:bg-[#235048]"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-[#777]">
                  <Truck className="h-4 w-4 text-[#b07838]" /> Free Doorstep Delivery Across India
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL FOR ENTIRE CART */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        user={user}
        clearCartAfterOrder={true}
        onOrderPlaced={() => {
          fetchCart();
        }}
      />
    </main>
  );
};

export default Cart;

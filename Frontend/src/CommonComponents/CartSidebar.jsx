import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { StoreContext } from "../PrivateRouter/StoreContext";
import { useAuth } from "../PrivateRouter/AuthContext";
import CheckoutModal from "../Componets/Checkout/CheckoutModal";

const CartSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    loadingCart,
    fetchCart,
    isCartOpen,
    closeCart,
  } = useContext(StoreContext);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Lock body scroll when cart sidebar is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen && !isCheckoutOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, isCheckoutOpen, closeCart]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const totalItemsCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9990] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        aria-modal="true"
        role="dialog"
      >
        {/* BACKDROP CLICK DISMISS */}
        <div
          className="absolute inset-0"
          onClick={closeCart}
          aria-hidden="true"
        />

        {/* SIDEBAR PANEL */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:max-w-lg">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#eee5d8] bg-[#faf8f5] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a3c36] text-white shadow-xs">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1d2925]">
                  Shopping Cart
                </h2>
                <p className="text-[11px] text-[#777]">
                  {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-[#c83a3a] hover:bg-red-50 hover:underline"
                  title="Remove all items from cart"
                >
                  Clear All
                </button>
              )}

              <button
                type="button"
                onClick={closeCart}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#777] transition hover:bg-[#ede5d8] hover:text-[#222]"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CONTENT / ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {loadingCart ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#1a3c36] border-t-transparent" />
                <p className="mt-3 text-xs font-semibold text-[#888]">
                  Loading your cart items...
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4eee5] text-[#b07838] shadow-inner">
                  <ShoppingBag className="h-9 w-9" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#1d2925]">
                  Your cart is empty
                </h3>
                <p className="mt-1 max-w-xs text-xs text-[#777]">
                  Looks like you haven't added any customized photo frames yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate("/shop");
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
                >
                  Explore Frames
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cart.map((item) => {
                  const img =
                    item.preview_image ||
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
                      className="group relative flex gap-3 rounded-2xl border border-[#ece4d8] bg-[#fdfcfb] p-3 shadow-2xs transition hover:border-[#d4a553] hover:bg-white"
                    >
                      {/* THUMBNAIL */}
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ebdccb] bg-[#f7f3ed] p-1">
                        {img ? (
                          <img
                            src={img}
                            alt={item.product_name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-[#b9aa98]" />
                        )}
                      </div>

                      {/* ITEM DETAILS */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="truncate text-xs font-bold text-[#1d2925]">
                              {item.product_name}
                            </h4>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#999] transition hover:text-[#d04d4d]"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#777]">
                            <span className="rounded bg-[#f2ecdf] px-1.5 py-0.5 text-[10px] font-bold text-[#444]">
                              {item.size || "Standard"}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-[#1a3c36]">
                              ₹{item.price}
                            </span>
                          </div>

                          {/* CUSTOM PHOTOS BADGE */}
                          {customPhotoEntries.length > 0 && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#1b794b]">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{customPhotoEntries.length} Photo{customPhotoEntries.length !== 1 ? "s" : ""} Attached</span>
                            </div>
                          )}
                        </div>

                        {/* QUANTITY & ITEM SUBTOTAL ROW */}
                        <div className="mt-2.5 flex items-center justify-between border-t border-[#f5ede3] pt-2">
                          {/* WORKING QUANTITY CONTROLS */}
                          <div className="inline-flex items-center rounded-lg border border-[#d8cfc3] bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, Number(item.quantity || 1) - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center text-xs font-bold text-[#555] transition hover:bg-[#faf7f3] disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-7 text-center font-mono text-xs font-bold text-[#1d2925]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, Number(item.quantity || 1) + 1)}
                              className="flex h-7 w-7 items-center justify-center text-xs font-bold text-[#1a3c36] transition hover:bg-[#faf7f3]"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-black text-[#1a3c36]">
                            ₹{itemSubtotal}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER & CHECKOUT */}
          {cart.length > 0 && (
            <div className="border-t border-[#eee5d8] bg-[#faf8f5] p-5 shadow-lg">
              <div className="space-y-1.5 text-xs text-[#666]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
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
                  <span className="text-base text-[#1a3c36]">₹{totalAmount}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3c36] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#235048]"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate("/shop");
                  }}
                  className="w-full text-center text-[11px] font-semibold text-[#777] hover:text-[#1a3c36] hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMBEDDED CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        user={user}
        clearCartAfterOrder={true}
        onOrderPlaced={() => {
          fetchCart();
          closeCart();
        }}
      />
    </>
  );
};

export default CartSidebar;

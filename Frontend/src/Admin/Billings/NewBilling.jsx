import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Minus,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const money = (value) =>
  `₹ ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fieldClass =
  "mt-1 h-9 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-xs outline-none focus:border-[#ff8a4c]";

const parseVariants = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const NewBilling = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState("0");
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("2000");
  const [discount, setDiscount] = useState("0");
  const [shippingCharge, setShippingCharge] = useState("0");
  const [packagingCharge, setPackagingCharge] = useState("0");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const itemDiscountTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.discount || 0), 0),
    [items],
  );
  const total = Math.max(
    subtotal -
      itemDiscountTotal -
      Number(discount || 0) +
      Number(shippingCharge || 0) +
      Number(packagingCharge || 0),
    0,
  );
  const change = Math.max(Number(receivedAmount || 0) - total, 0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        const products = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const catalog = products.map((product, index) => ({
          id: product.product_id || product.id || `product-${index}`,
          name: product.product_name || product.name || "Unnamed Product",
          detail: product.size || product.product_code || "",
          category: product.category || "General",
          price: Number(product.selling_price ?? product.price ?? 0),
          variants: parseVariants(product.size_variants),
          quantity: 1,
          discount: 0,
        }));
        if (catalog.length) setProductOptions(catalog);
      } catch (error) {
        console.error("Failed to load products for billing:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        const userList = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setUsers(
          userList.filter(
            (user) => String(user.role || "user").toLowerCase() === "user",
          ),
        );
      } catch (error) {
        console.error("Failed to load users for billing:", error);
      }
    };

    fetchUsers();
  }, []);

  const updateQuantity = (id, amount) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    );
  const removeItem = (id) =>
    setItems((current) => current.filter((item) => item.id !== id));
  const updateItemDiscount = (id, value) =>
    setItems((current) =>
      current.map((item) =>
        String(item.id) === String(id)
          ? { ...item, discount: Math.max(0, Number(value) || 0) }
          : item,
      ),
    );

  const selectedProduct = productOptions.find(
    (option) => String(option.id) === selectedProductId,
  );
  const filteredProductOptions = productOptions.filter((product) => {
    const query = productSearch.trim().toLowerCase();
    return (
      !query ||
      `${product.name} ${product.detail} ${product.category}`
        .toLowerCase()
        .includes(query)
    );
  });
  const filteredCustomers = users
    .filter((user) => {
      const query = customerSearch.trim().toLowerCase();
      return (
        !query ||
        `${user.username || ""} ${user.name || ""} ${user.email || ""} ${user.mobile_number || user.phone || ""}`
          .toLowerCase()
          .includes(query)
      );
    })
    .slice(0, 8);

  const selectCustomer = (user) => {
    setSelectedCustomer(user);
    setCustomerSearch(user.username || user.name || user.email || "");
  };

  const addSelectedProduct = () => {
    const product = productOptions.find(
      (option) => String(option.id) === selectedProductId,
    );
    if (!product) return;
    const variant = product.variants?.[Number(selectedVariantIndex)];
    const item = {
      ...product,
      id: `${product.id}-${selectedVariantIndex}`,
      detail: variant?.size || product.detail,
      price: Number(
        variant?.offer_price ??
          variant?.selling_price ??
          variant?.mrp ??
          product.price,
      ),
    };

    setItems((current) => {
      const existing = current.find(
        (currentItem) => String(currentItem.id) === String(item.id),
      );
      if (existing) {
        return current.map((currentItem) =>
          String(currentItem.id) === String(item.id)
            ? { ...currentItem, quantity: currentItem.quantity + 1 }
            : currentItem,
        );
      }
      return [...current, item];
    });
    setSelectedProductId("");
    setSelectedVariantIndex("0");
    setProductSearch("");
    setShowProductModal(false);
  };

  return (
    <div className="billing-page min-h-screen bg-[#f3f4f6] p-4 text-[#1f2937] md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <style>{`.billing-page table th:nth-child(6), .billing-page table td:nth-child(6) { display: none; }`}</style>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setShowProductModal(true)}
            className="rounded-md border border-[#ff9869] px-4 py-2 text-xs font-semibold text-[#ed6b26]"
          >
            <Plus className="mr-1 inline h-3.5 w-3.5" /> Add Item
          </button>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-4 text-sm font-bold">Order Details</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-[10px] font-semibold">
                Order Date *
                <input
                  type="date"
                  defaultValue="2025-05-06"
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Order Time *
                <input
                  type="time"
                  defaultValue="11:30"
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Order Type
                <select className={fieldClass}>
                  <option>Shop Order</option>
                  <option>Online Order</option>
                </select>
              </label>
            </div>
            <section className="mb-3 rounded-lg border border-[#e5e7eb] bg-white p-3"><h2 className="text-sm font-bold">Select Customer</h2><div className="relative mt-3 max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" /><input value={customerSearch} onChange={(event) => { setCustomerSearch(event.target.value); setSelectedCustomer(null); }} placeholder="Search by name, email, or mobile number..." className="h-10 w-full rounded-md border border-[#e5e7eb] pl-9 pr-3 text-xs outline-none focus:border-[#ff8a4c]" />{customerSearch && !selectedCustomer && <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-[#e5e7eb] bg-white shadow-lg">{filteredCustomers.length ? filteredCustomers.map((user) => <button type="button" key={user.user_id || user.id || user.email} onClick={() => selectCustomer(user)} className="block w-full border-b border-[#f0f1f3] px-3 py-2 text-left text-xs hover:bg-[#fff4ed]"><span className="font-semibold">{user.username || user.name || "Unnamed User"}</span><span className="ml-2 text-[#6b7280]">{user.email || user.mobile_number || user.phone || ""}</span></button>) : <p className="px-3 py-3 text-xs text-[#6b7280]">No users found.</p>}</div>}</div>{selectedCustomer && <div className="mt-3 grid gap-2 rounded-md bg-[#fffaf7] p-3 text-xs sm:grid-cols-3"><span><b>Name:</b> {selectedCustomer.username || selectedCustomer.name}</span><span><b>Email:</b> {selectedCustomer.email || "-"}</span><span><b>Phone:</b> {selectedCustomer.mobile_number || selectedCustomer.phone || "-"}</span></div>}</section>

          </section>
          <section className="rounded-lg mt-5 border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-4 text-sm font-bold">Customer Details</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-[10px] font-semibold">
                Name *
                <input
                  value={selectedCustomer?.username || selectedCustomer?.name || selectedCustomer?.full_name || ""}
                  readOnly
                  placeholder="Enter customer name"
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Email
                <input
                  type="email"
                  value={selectedCustomer?.email || ""}
                  readOnly
                  placeholder="Enter email address"
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Phone *
                <input
                  value={selectedCustomer?.mobile_number || selectedCustomer?.phone || selectedCustomer?.mobile || ""}
                  readOnly
                  placeholder="Enter phone number"
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Address
                <textarea
                  value={selectedCustomer?.address || selectedCustomer?.full_address || selectedCustomer?.billing_address || ""}
                  readOnly
                  placeholder="Enter complete address"
                  className="mt-1 h-14 w-full resize-none rounded-md border border-[#e5e7eb] px-3 py-2 text-xs outline-none focus:border-[#ff8a4c]"
                />
              </label>
            </div>
          </section>
        </div>

        <section className="mt-3 rounded-lg border border-[#e5e7eb] bg-white p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Order Items</h2><button type="button" onClick={() => setShowProductModal(true)} className="rounded-md border border-[#ff9869] px-3 py-2 text-xs font-semibold text-[#ed6b26]"><Plus className="mr-1 inline h-3.5 w-3.5" /> Add Item</button></div>{items.length ? <div className="overflow-x-auto"><table className="min-w-full text-left text-[11px]"><thead><tr className="bg-[#fff4ed] font-semibold"><th className="rounded-tl-md px-2 py-3">S No</th><th className="px-2 py-3">Product</th><th className="px-2 py-3">Category</th><th className="px-2 py-3">Price</th><th className="px-2 py-3">Qty</th><th className="px-2 py-3">Discount</th><th className="px-2 py-3">Total</th><th className="rounded-tr-md px-2 py-3">Action</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id} className="border-b border-[#f0f1f3]"><td className="px-2 py-3">{index + 1}</td><td className="px-2 py-3 font-semibold">{item.name}<div className="font-normal text-[#6b7280]">{item.detail || "-"}</div></td><td className="px-2 py-3">{item.category}</td><td className="px-2 py-3">{money(item.price)}</td><td className="px-2 py-3"><div className="flex items-center"><button type="button" onClick={() => updateQuantity(item.id, -1)} className="border border-[#e5e7eb] px-2 py-1"><Minus className="h-3 w-3" /></button><span className="border-y border-[#e5e7eb] px-3 py-1">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} className="border border-[#e5e7eb] px-2 py-1"><Plus className="h-3 w-3" /></button></div></td><td className="px-2 py-3"><input type="number" min="0" value={item.discount} onChange={(event) => updateItemDiscount(item.id, event.target.value)} className="h-9 w-24 rounded-md border border-[#e5e7eb] px-2 text-right text-xs" /></td><td className="px-2 py-3 font-semibold">{money(item.price * item.quantity - Number(item.discount || 0))}</td><td className="px-2 py-3"><button type="button" onClick={() => removeItem(item.id)} className="rounded-md border border-[#ffb3b3] p-2 text-[#d04d4d]"><Trash2 className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-xs text-[#6b7280]">No products added. Click Add Item to select a product.</p>}</section>

        <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr_0.85fr]">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-sm font-bold">Order Notes</h2>
            <textarea
              placeholder="Enter order notes (optional)"
              className="mt-3 h-24 w-full resize-none rounded-md border border-[#e5e7eb] p-3 text-xs outline-none focus:border-[#ff8a4c]"
            />
          </section>
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-sm font-bold">Discount &amp; Charges</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-semibold">
                Discount Type
                <select className={fieldClass}>
                  <option>Flat Discount</option>
                  <option>Percentage</option>
                </select>
              </label>
              <label className="text-[10px] font-semibold">
                Discount Amount (₹)
                <input
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Shipping Charge (₹)
                <input
                  value={shippingCharge}
                  onChange={(event) => setShippingCharge(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="text-[10px] font-semibold">
                Packaging Charge (₹)
                <input
                  value={packagingCharge}
                  onChange={(event) => setPackagingCharge(event.target.value)}
                  className={fieldClass}
                />
              </label>
            </div>
          </section>
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-3 text-xs">
            <div className="space-y-2">
              <p className="flex justify-between">
                Subtotal <b>{money(subtotal)}</b>
              </p>
              <p className="flex justify-between">
                Discount <b className="text-[#198754]">- {money(discount)}</b>
              </p>
              <p className="flex justify-between">
                Shipping Charge <b>{money(shippingCharge)}</b>
              </p>
              <p className="flex justify-between">
                Packaging Charge <b>{money(packagingCharge)}</b>
              </p>
              <p className="flex justify-between">
                Tax (18%) <b>{money(0)}</b>
              </p>
              <p className="flex justify-between border-t border-[#e5e7eb] pt-3 text-sm font-bold">
                Total Amount{" "}
                <strong className="text-lg text-[#ed5d19]">
                  {money(total)}
                </strong>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-[#e5e7eb] bg-white p-3 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-[10px] font-semibold">
              Payment Method *
              <select className={fieldClass}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </label>
            <label className="text-[10px] font-semibold">
              Received Amount (₹)
              <input
                value={receivedAmount}
                onChange={(event) => setReceivedAmount(event.target.value)}
                className={fieldClass}
              />
            </label>
            <div className="text-[10px] font-semibold">
              Change (₹)
              <div className="mt-1 flex h-9 items-center rounded-md bg-[#e8f7ed] px-3 text-xs text-[#198754]">
                {change.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/billing")}
              className="rounded-md border border-[#e5e7eb] px-5 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-[#ff9869] px-5 py-2 text-xs font-semibold text-[#ed6b26]"
            >
              <Printer className="h-4 w-4" /> Print Preview
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-[#f56618] px-5 py-2 text-xs font-semibold text-white"
            >
              <Printer className="h-4 w-4" /> Generate Bill
            </button>
          </div>
        </div>

        {showProductModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-item-title"
          >
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="add-item-title" className="text-base font-bold">
                  Add Item
                </h2>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="text-sm text-[#6b7280]"
                >
                  Close
                </button>
              </div>
              <label className="block text-xs font-semibold">
                Search Product
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search product name, code, or category..."
                  className={fieldClass}
                />
              </label>
              <label className="mt-3 block text-xs font-semibold">
                Select Product
                <select
                  value={selectedProductId}
                  onChange={(event) => {
                    setSelectedProductId(event.target.value);
                    setSelectedVariantIndex("0");
                  }}
                  className={fieldClass}
                >
                  <option value="">Select product...</option>
                  {filteredProductOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              {selectedProduct?.variants?.length > 0 && (
                <label className="mt-3 block text-xs font-semibold">
                  Select Frame Size
                  <select
                    value={selectedVariantIndex}
                    onChange={(event) =>
                      setSelectedVariantIndex(event.target.value)
                    }
                    className={fieldClass}
                  >
                    {selectedProduct.variants.map((variant, index) => (
                      <option
                        key={`${variant.size || "size"}-${index}`}
                        value={index}
                      >
                        {variant.size || "Size"} -{" "}
                        {money(
                          variant.offer_price ??
                            variant.selling_price ??
                            variant.mrp ??
                            selectedProduct.price,
                        )}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-md border border-[#e5e7eb] px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addSelectedProduct}
                  disabled={!selectedProductId}
                  className="rounded-md bg-[#f56618] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBilling;

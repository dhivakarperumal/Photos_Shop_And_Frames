import { useEffect, useState } from "react";
import { LockKeyhole, MapPin, Package, Pencil, Save, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import { useAuth } from "../../PrivateRouter/AuthContext";

const emptyAddress = { customer_name: "", mobile_number: "", address_line1: "", address_line2: "", city: "", district: "", state: "Tamil Nadu", country: "India", pincode: "", landmark: "" };
const statusClass = { Delivered: "bg-[#e1f2e8] text-[#28724a]", Cancelled: "bg-[#fae5e2] text-[#a43e32]", Shipped: "bg-[#e3edf7] text-[#35688e]" };

const Account = () => {
  const { user, setUser } = useAuth();
  const userId = user?.user_id || user?.id;
  const [profile, setProfile] = useState({ username: "", mobile_number: "" });
  const [address, setAddress] = useState(emptyAddress);
  const [orders, setOrders] = useState([]);
  const [editingAddress, setEditingAddress] = useState(false);
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    Promise.all([api.get(`/users/profile/${userId}`), api.get(`/users/address/${userId}`), api.get(`/orders/user/${userId}`)])
      .then(([profileResponse, addressResponse, ordersResponse]) => {
        const nextProfile = profileResponse.data?.data || user;
        setProfile({ username: nextProfile?.username || "", mobile_number: nextProfile?.mobile_number || nextProfile?.phone || "" });
        setAddress({ ...emptyAddress, ...(addressResponse.data?.data || {}) });
        setOrders(ordersResponse.data?.data || []);
      })
      .catch(() => toast.error("We could not load your account details"));
  }, [userId]);

  const updateProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/profile/${userId}`, profile);
      const nextUser = { ...user, username: profile.username, name: profile.username, displayName: profile.username, mobile_number: profile.mobile_number, phone: profile.mobile_number };
      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      toast.success("Profile updated");
    } catch (error) { toast.error(error.response?.data?.message || "Could not update profile"); } finally { setSaving(false); }
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setSaving(true);
    try { const response = await api.put(`/users/address/${userId}`, address); setAddress({ ...emptyAddress, ...response.data.data }); setEditingAddress(false); toast.success("Address saved"); } catch (error) { toast.error(error.response?.data?.message || "Could not save address"); } finally { setSaving(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) return toast.error("New passwords do not match");
    setSaving(true);
    try { await api.put(`/users/password/${userId}`, password); setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" }); toast.success("Password changed"); } catch (error) { toast.error(error.response?.data?.message || "Could not change password"); } finally { setSaving(false); }
  };

  const setAddressField = (field, value) => setAddress((current) => ({ ...current, [field]: value }));
  const addressText = [address.address_line1, address.address_line2, address.city, address.district, address.state, address.pincode].filter(Boolean).join(", ");

  return <main className="min-h-screen bg-[#f8f6f1] pb-20 pt-14">
    <PageContainer>
      <div className="mb-12 flex flex-col justify-between gap-5 border-b border-[#dfd6ca] pb-8 md:flex-row md:items-end">
        <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#b87840]">Personal space</p><h1 className="font-serif text-5xl font-medium text-[#1b2925]">My account</h1><p className="mt-3 text-sm text-[#68736e]">Keep your details close. Follow every frame from order to doorstep.</p></div>
        <div className="flex items-center gap-3 text-sm text-[#68736e]"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2925] text-white">{(profile.username || user?.email || "U")[0].toUpperCase()}</span>{profile.username || user?.email}</div>
      </div>
      <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[#dfd6ca] bg-white p-6 sm:p-8"><div className="mb-7 flex items-center gap-3"><UserRound className="text-[#b87840]" size={21} /><div><h2 className="text-xl font-semibold text-[#1b2925]">Profile details</h2><p className="text-xs text-[#7b8580]">The details we use to reach you.</p></div></div><form onSubmit={updateProfile} className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wider text-[#68736e]">Full name<input required value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} className="mt-2 h-12 w-full border border-[#ddd6ce] bg-[#fcfbf8] px-4 text-sm outline-none focus:border-[#b87840]" /></label><label className="text-xs font-bold uppercase tracking-wider text-[#68736e]">Email<input disabled value={user?.email || ""} className="mt-2 h-12 w-full border border-[#ddd6ce] bg-[#f2f0eb] px-4 text-sm text-[#87908b]" /></label><label className="text-xs font-bold uppercase tracking-wider text-[#68736e]">Phone<input value={profile.mobile_number} onChange={(event) => setProfile({ ...profile, mobile_number: event.target.value })} className="mt-2 h-12 w-full border border-[#ddd6ce] bg-[#fcfbf8] px-4 text-sm outline-none focus:border-[#b87840]" /></label><div className="flex items-end"><button disabled={saving} className="flex h-12 items-center gap-2 bg-[#1b2925] px-5 text-sm font-semibold text-white transition hover:bg-[#b87840] disabled:opacity-60"><Save size={16} />Save details</button></div></form></section>
        <section className="border border-[#dfd6ca] bg-[#1b2925] p-6 text-white sm:p-8"><div className="mb-7 flex items-center justify-between"><div className="flex items-center gap-3"><MapPin className="text-[#edcca3]" size={21} /><div><h2 className="text-xl font-semibold">Saved address</h2><p className="text-xs text-white/55">Your latest delivery destination.</p></div></div><button onClick={() => setEditingAddress((current) => !current)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#edcca3]"><Pencil size={14} />{editingAddress ? "Close" : "Edit"}</button></div>{editingAddress ? <form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2">{[["customer_name","Name"],["mobile_number","Phone"],["address_line1","Address line 1"],["address_line2","Address line 2"],["city","City"],["district","District"],["state","State"],["country","Country"],["pincode","Pincode"],["landmark","Landmark"]].map(([field, label]) => <input key={field} required={field === "customer_name" || field === "mobile_number" || field === "address_line1" || field === "city" || field === "pincode"} placeholder={label} value={address[field] || ""} onChange={(event) => setAddressField(field, event.target.value)} className="h-11 border border-white/15 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#edcca3]" />)}<button disabled={saving} className="h-11 bg-[#b87840] text-sm font-semibold text-white sm:col-span-2">Save address</button></form> : <div className="space-y-3 text-sm leading-6 text-white/75"><p className="text-lg font-medium text-white">{address.customer_name || "No saved address yet"}</p><p>{address.mobile_number}</p><p>{addressText || "Your address will appear here after your first checkout."}</p>{address.landmark && <p className="text-white/50">Near {address.landmark}</p>}</div>}</section>
        <section className="border border-[#dfd6ca] bg-white p-6 sm:p-8 lg:col-span-2"><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><Package className="text-[#b87840]" size={21} /><div><h2 className="text-xl font-semibold text-[#1b2925]">Your orders</h2><p className="text-xs text-[#7b8580]">A quiet record of everything you have framed.</p></div></div><span className="text-xs font-bold uppercase tracking-wider text-[#9a6030]">{orders.length} total</span></div>{orders.length ? <div className="divide-y divide-[#eee9e3]">{orders.map((order) => <div key={order.order_id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#1b2925]">{order.order_id}</p><p className="mt-1 text-xs text-[#7b8580]">{new Date(order.created_at || order.order_date).toLocaleDateString()} · {order.item_count || 0} items</p></div><div className="flex items-center gap-6"><span className={`px-3 py-1 text-xs font-bold ${statusClass[order.order_status] || "bg-[#f3eee7] text-[#7b6a58]"}`}>{order.order_status || "Processing"}</span><strong className="text-[#1b2925]">₹{Number(order.total_amount || 0).toLocaleString("en-IN")}</strong></div></div>)}</div> : <p className="py-8 text-sm text-[#7b8580]">No orders yet. Your next beautiful frame will show up here.</p>}</section>
        <section className="border border-[#dfd6ca] bg-white p-6 sm:p-8 lg:col-span-2"><div className="mb-7 flex items-center gap-3"><LockKeyhole className="text-[#b87840]" size={21} /><div><h2 className="text-xl font-semibold text-[#1b2925]">Change password</h2><p className="text-xs text-[#7b8580]">Use at least 8 characters for your new password.</p></div></div><form onSubmit={changePassword} className="grid gap-4 md:grid-cols-3"><input required type="password" placeholder="Current password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} className="h-12 border border-[#ddd6ce] bg-[#fcfbf8] px-4 text-sm outline-none focus:border-[#b87840]" /><input required minLength={8} type="password" placeholder="New password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} className="h-12 border border-[#ddd6ce] bg-[#fcfbf8] px-4 text-sm outline-none focus:border-[#b87840]" /><div className="flex gap-3"><input required type="password" placeholder="Confirm password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} className="h-12 min-w-0 flex-1 border border-[#ddd6ce] bg-[#fcfbf8] px-4 text-sm outline-none focus:border-[#b87840]" /><button disabled={saving} className="h-12 bg-[#b87840] px-4 text-sm font-semibold text-white">Update</button></div></form></section>
      </div>
    </PageContainer>
  </main>;
};

export default Account;
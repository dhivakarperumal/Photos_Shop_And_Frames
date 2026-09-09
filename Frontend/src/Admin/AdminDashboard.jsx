import { useEffect, useMemo, useState } from 'react';
import { 
  Calendar, 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  Package, 
  TrendingUp, 
  ChevronDown,
  ShoppingCart,
  User,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../api';

const salesData = [
  { name: '1 May', value: 25000 },
  { name: '3 May', value: 45000 },
  { name: '5 May', value: 65000 },
  { name: '7 May', value: 33000 },
  { name: '9 May', value: 58000 },
  { name: '11 May', value: 92000 },
  { name: '12 May', value: 38000 },
  { name: '14 May', value: 65000 },
  { name: '16 May', value: 85000 },
  { name: '18 May', value: 60000 },
  { name: '20 May', value: 125430 },
  { name: '22 May', value: 65000 },
  { name: '24 May', value: 95000 },
  { name: '26 May', value: 140000 },
  { name: '28 May', value: 90000 },
  { name: '30 May', value: 110000 },
  { name: '31 May', value: 145000 }
];

const statusColors = {
  DELIVERED: '#166534',
  PROCESSING: '#f59e0b',
  SHIPPED: '#3b82f6',
  CANCELLED: '#a855f7',
  RETURNED: '#9ca3af',
  PENDING: '#64748b',
};

const dateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA');
};

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AdminDashboard = () => {
  const [dashboardCounts, setDashboardCounts] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    products: 0,
    lowStock: 0,
    delivered: 0,
    todayOrders: 0,
    cancelled: 0,
  });
  const [orders, setOrders] = useState([]);
  const [catalogItems, setCatalogItems] = useState({ products: [], albums: [], gifts: [] });
  const [dateFilter, setDateFilter] = useState('this-month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filterLabel = {
    all: 'All Dates',
    today: 'Today',
    yesterday: 'Yesterday',
    'this-week': 'This Week',
    'this-month': 'This Month',
    'last-month': 'Last Month',
    custom: 'Custom Range',
  }[dateFilter];

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let from;
    let to;

    if (dateFilter === 'today') {
      from = today;
      to = today;
    } else if (dateFilter === 'yesterday') {
      from = new Date(today);
      from.setDate(from.getDate() - 1);
      to = from;
    } else if (dateFilter === 'this-week') {
      from = new Date(today);
      from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
      to = today;
    } else if (dateFilter === 'this-month') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = today;
    } else if (dateFilter === 'last-month') {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (dateFilter === 'custom' && customFrom && customTo) {
      from = new Date(`${customFrom}T00:00:00`);
      to = new Date(`${customTo}T00:00:00`);
    }

    if (!from || !to || from > to) return dateFilter === 'all' ? orders : [];
    const fromKey = formatDateInput(from);
    const toKey = formatDateInput(to);
    return orders.filter((order) => {
      const orderKey = dateKey(order.order_date || order.created_at);
      return orderKey >= fromKey && orderKey <= toKey;
    });
  }, [customFrom, customTo, dateFilter, orders]);

  const filteredOrderCounts = useMemo(() => ({
    orders: filteredOrders.length,
    revenue: filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    delivered: filteredOrders.filter((order) => ['delivered', 'completed'].includes(String(order.order_status || '').toLowerCase())).length,
    todayOrders: filteredOrders.filter((order) => dateKey(order.order_date || order.created_at) === dateKey(new Date())).length,
    cancelled: filteredOrders.filter((order) => String(order.order_status || '').toLowerCase() === 'cancelled').length,
  }), [filteredOrders]);

  const orderStatusData = useMemo(() => {
    const buckets = {
      Delivered: 0,
      Processing: 0,
      Shipped: 0,
      Cancelled: 0,
      Returned: 0,
    };

    filteredOrders.forEach((order) => {
      const rawStatus = String(order.order_status || '').trim();
      const key = rawStatus.toLowerCase();
      if (['delivered', 'completed'].includes(key)) {
        buckets.Delivered += 1;
      } else if (['processing', 'packing', 'ready', 'out for delivery', 'out_for_delivery'].includes(key)) {
        buckets.Processing += 1;
      } else if (['shipped'].includes(key)) {
        buckets.Shipped += 1;
      } else if (['cancelled'].includes(key)) {
        buckets.Cancelled += 1;
      } else if (['returned'].includes(key)) {
        buckets.Returned += 1;
      }
    });

    const total = Object.values(buckets).reduce((sum, value) => sum + value, 0) || 1;

    return [
      { name: 'Delivered', value: buckets.Delivered, color: statusColors.DELIVERED },
      { name: 'Processing', value: buckets.Processing, color: statusColors.PROCESSING },
      { name: 'Shipped', value: buckets.Shipped, color: statusColors.SHIPPED },
      { name: 'Cancelled', value: buckets.Cancelled, color: statusColors.CANCELLED },
      { name: 'Returned', value: buckets.Returned, color: statusColors.RETURNED },
    ].map((entry) => ({
      ...entry,
      percent: Math.round((entry.value / total) * 100),
    }));
  }, [filteredOrders]);

  const topCategories = useMemo(() => {
    const counts = new Map();
    const addEntries = (items, type = 'Category') => {
      items.forEach((item) => {
        const label = String(item?.category || item?.sub_category || type || 'General').trim() || type;
        const key = label.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    };

    addEntries(catalogItems.products, 'Photo Frames');
    addEntries(catalogItems.albums, 'Albums');
    addEntries(catalogItems.gifts, 'Gifts');

    const entries = [...counts.entries()]
      .map(([key, value]) => ({
        name: key === 'general' ? 'General' : key.charAt(0).toUpperCase() + key.slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const total = entries.reduce((sum, entry) => sum + entry.value, 0) || 1;
    return entries.map((entry) => ({
      ...entry,
      percent: Math.max(5, Math.round((entry.value / total) * 100)),
      icon: /gift/.test(entry.name.toLowerCase())
        ? <Package size={18} className="text-red-600" />
        : /album/.test(entry.name.toLowerCase())
          ? <ImageIcon size={18} className="text-emerald-700" />
          : <ImageIcon size={18} className="text-amber-700" />,
      iconBg: /gift/.test(entry.name.toLowerCase())
        ? 'bg-red-100'
        : /album/.test(entry.name.toLowerCase())
          ? 'bg-emerald-100'
          : 'bg-amber-100',
    }));
  }, [catalogItems]);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const [ordersResponse, usersResponse, productsResponse, albumsResponse, giftsResponse] = await Promise.all([
          api.get('/orders'),
          api.get('/users'),
          api.get('/products'),
          api.get('/albums'),
          api.get('/gift-boxes'),
        ]);
        const orders = Array.isArray(ordersResponse.data?.data) ? ordersResponse.data.data : [];
        const users = Array.isArray(usersResponse.data?.data) ? usersResponse.data.data : [];
        const products = Array.isArray(productsResponse.data?.data) ? productsResponse.data.data : [];
        const albums = Array.isArray(albumsResponse.data?.data) ? albumsResponse.data.data : [];
        const gifts = Array.isArray(giftsResponse.data?.data) ? giftsResponse.data.data : [];

        const lowStockProducts = products.filter((product) => {
          let variants = [];
          if (Array.isArray(product.size_variants)) variants = product.size_variants;
          else if (typeof product.size_variants === 'string') {
            try { variants = JSON.parse(product.size_variants); } catch (e) { variants = []; }
          }
          const stock = variants.length ? variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0) : 0;
          return stock <= 15;
        }).length;

        const lowStockAlbums = albums.filter((album) => {
          let variants = [];
          if (Array.isArray(album.variants)) variants = album.variants;
          else if (typeof album.variants === 'string') {
            try { variants = JSON.parse(album.variants); } catch (e) { variants = []; }
          }
          const stock = variants.length ? variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0) : Number(album.stock_quantity || 0);
          return stock <= 15;
        }).length;

        const lowStockGifts = gifts.filter((gift) => {
          const stock = Number(gift.current_stock ?? gift.stock_quantity ?? 0);
          return stock <= 15;
        }).length;

        const totalProducts = products.length + albums.length + gifts.length;
        const totalLowStock = lowStockProducts + lowStockAlbums + lowStockGifts;

        setOrders(orders);
        setCatalogItems({ products, albums, gifts });
        setDashboardCounts((current) => ({
          ...current,
          customers: users.filter((user) => !['admin', 'super admin'].includes(String(user.role || '').toLowerCase())).length,
          products: totalProducts,
          lowStock: totalLowStock,
        }));
      } catch (error) {
        console.error('Failed to load dashboard counts:', error);
      }
    };

    fetchDashboardCounts();
  }, []);

  return (
    <div className="p-2  min-h-screen text-gray-800 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, Admin! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <label className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
          <Calendar size={16} className="text-gray-500" />
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="bg-transparent text-sm text-gray-800 outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <ChevronDown size={16} className="text-gray-500" />
          </label>
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <label className="flex items-center gap-1">
                From
                <input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="rounded border border-gray-200 bg-white px-2 py-2" />
              </label>
              <label className="flex items-center gap-1">
                To
                <input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="rounded border border-gray-200 bg-white px-2 py-2" />
              </label>
            </div>
          )}
          <span className="sr-only">{filterLabel}</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Orders', value: filteredOrderCounts.orders.toLocaleString(), inc: '18.6%', icon: <ShoppingBag size={24} className="text-white" />, iconBg: 'bg-[#22c55e]' }, // Bright Green
          { title: 'Total Revenue', value: `₹${filteredOrderCounts.revenue.toLocaleString('en-IN')}`, inc: '22.4%', icon: <IndianRupee size={24} className="text-white" />, iconBg: 'bg-[#f59e0b]' }, // Bright Amber
          { title: 'Total Customers', value: dashboardCounts.customers.toLocaleString(), inc: '15.3%', icon: <Users size={24} className="text-white" />, iconBg: 'bg-[#06b6d4]' }, // Bright Cyan
          { title: 'Total Products', value: dashboardCounts.products.toLocaleString(), inc: '10.7%', icon: <Package size={24} className="text-white" />, iconBg: 'bg-[#a855f7]' }, // Bright Purple
          { title: 'Low Stock', value: dashboardCounts.lowStock.toLocaleString(), inc: 'Needs attention', icon: <Package size={24} className="text-white" />, iconBg: 'bg-[#f97316]' },
          { title: 'Delivered', value: filteredOrderCounts.delivered.toLocaleString(), inc: 'Completed orders', icon: <ShoppingBag size={24} className="text-white" />, iconBg: 'bg-[#166534]' },
          { title: "Today's Orders", value: filteredOrderCounts.todayOrders.toLocaleString(), inc: 'Since midnight', icon: <Calendar size={24} className="text-white" />, iconBg: 'bg-[#3b82f6]' },
          { title: 'Cancelled Orders', value: filteredOrderCounts.cancelled.toLocaleString(), inc: 'Cancelled orders', icon: <ShoppingCart size={24} className="text-white" />, iconBg: 'bg-[#dc2626]' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-full">
            <div className="flex items-start space-x-4 flex-1">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                 {stat.icon}
              </div>
              <div className="flex flex-col">
                <p className="text-gray-600 text-xs font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{stat.value}</h3>
                <div className="flex flex-col">
                  <div className="flex items-center text-emerald-600 text-xs font-medium mb-1">
                    <TrendingUp size={12} className="mr-1" />
                    <span>{stat.inc}</span>
                  </div>
                  <p className="text-gray-400 text-[10px]">from last month</p>
                </div>
              </div>
            </div>
            {/* Decorative wave at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-8 overflow-hidden pointer-events-none">
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" className={`w-full h-full opacity-40`} fill="currentColor" style={{ color: stat.iconBg.replace('bg-[', '').replace(']', '') }}>
                  <path d="M0,10 C30,25 70,0 100,10 L100,20 L0,20 Z" />
                </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Overview Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-800">Sales Overview</h2>
            </div>
            <button className="flex items-center space-x-1 border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
              <span>This Month</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={(val) => `₹${val/1000}L`}
                  dx={-10}
                />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   formatter={(value) => [`₹${value}`, "Revenue"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#166534" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#166534' }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
               <ShoppingBag size={18} className="text-amber-500" />
               <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            </div>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-500 bg-white">
                <tr>
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order, i) => {
                  const status = String(order.order_status || 'Pending');
                  const statusLower = status.toLowerCase();
                  const badgeStyle = ['delivered', 'completed'].includes(statusLower)
                    ? { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
                    : ['processing', 'packing', 'ready', 'out for delivery', 'out_for_delivery'].includes(statusLower)
                      ? { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' }
                      : ['shipped'].includes(statusLower)
                        ? { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }
                        : ['cancelled'].includes(statusLower)
                          ? { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' }
                          : { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };

                  return (
                    <tr key={order.order_id || order.id || i} className="hover:bg-gray-50/50">
                      <td className="py-3 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded overflow-hidden">
                          <img src="https://via.placeholder.com/24" alt="prod" className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                        <span className="font-medium text-gray-700 text-xs">{order.order_id || `#${order.id || i + 1}`}</span>
                      </td>
                      <td className="py-3 text-xs text-gray-600">{order.customer_name || 'Customer'}</td>
                      <td className="py-3 text-xs font-medium text-gray-800">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeStyle.bg} ${badgeStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${badgeStyle.dot}`}></span>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!orders.length && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-xs text-gray-500">No recent orders available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-800">Top Categories</h2>
            <button className="flex items-center space-x-1 border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
              <span>This Month</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="space-y-6">
            {topCategories.length ? topCategories.map((cat, i) => (
              <div key={`${cat.name}-${i}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md ${cat.iconBg}`}>
                      {cat.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{cat.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-emerald-800 h-1.5 rounded-full" style={{ width: `${cat.percent}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No category data available yet.</div>
            )}
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-6">Order Status Overview</h2>
          <div className="flex items-center justify-center">
             <div className="w-1/2 h-48 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="w-1/2 pl-4">
                <ul className="space-y-3">
                  {orderStatusData.map((status, i) => (
                    <li key={i} className="flex justify-between items-center text-xs">
                       <div className="flex items-center space-x-2">
                         <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }}></span>
                         <span className="text-gray-600">{status.name}</span>
                       </div>
                       <span className="font-medium text-gray-800">{status.value} ({status.percent}%)</span>
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-800">Recent Activities</h2>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-800">View All</button>
          </div>
          <div className="space-y-5">
            {[
              { text: 'New order #PF1250 received', time: '2 minutes ago', icon: <ShoppingCart size={14} className="text-white" />, bg: 'bg-emerald-600' },
              { text: 'Product "Wooden Frame" updated', time: '25 minutes ago', icon: <Package size={14} className="text-white" />, bg: 'bg-amber-500' },
              { text: 'Customer Priya Sharma registered', time: '1 hour ago', icon: <User size={14} className="text-white" />, bg: 'bg-blue-500' },
              { text: 'Banner "Summer Sale" added', time: '2 hours ago', icon: <ImageIcon size={14} className="text-white" />, bg: 'bg-purple-500' },
              { text: 'Coupon "WELCOME10" created', time: '3 hours ago', icon: <Tag size={14} className="text-white" />, bg: 'bg-emerald-700' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                    {activity.icon}
                  </div>
                  <span className="text-xs text-gray-700">{activity.text}</span>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default AdminDashboard;
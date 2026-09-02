import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  Download,
  Eye,
  Filter,
  PackageCheck,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';

const stockRows = [
  {
    product: 'Classic Wooden Frame',
    sku: 'PF-WD-001',
    category: 'Photo Frames',
    price: 899,
    offerPrice: 1299,
    currentStock: 52,
    available: 48,
    reserved: 4,
    status: 'In Stock',
    lastUpdated: '02 Sep 2024\n10:30 AM',
    image: 'linear-gradient(135deg, #d3b495, #f2e4d2)',
  },
  {
    product: 'Black Matt Frame',
    sku: 'PF-BK-002',
    category: 'Photo Frames',
    price: 699,
    offerPrice: 999,
    currentStock: 18,
    available: 15,
    reserved: 3,
    status: 'Low Stock',
    lastUpdated: '02 Sep 2024\n09:15 AM',
    image: 'linear-gradient(135deg, #d8d8d8, #b0b0b0)',
  },
  {
    product: 'Canvas Wall Print',
    sku: 'PF-CV-001',
    category: 'Photo Printing',
    price: 1299,
    offerPrice: 1799,
    currentStock: 35,
    available: 30,
    reserved: 5,
    status: 'In Stock',
    lastUpdated: '01 Sep 2024\n04:45 PM',
    image: 'linear-gradient(135deg, #a9c7d9, #e9d6c8)',
  },
  {
    product: 'LED Light Frame',
    sku: 'PF-LED-001',
    category: 'Custom Frames',
    price: 1599,
    offerPrice: 2199,
    currentStock: 12,
    available: 8,
    reserved: 4,
    status: 'Low Stock',
    lastUpdated: '01 Sep 2024\n03:20 PM',
    image: 'linear-gradient(135deg, #d6bf9a, #f3e1c1)',
  },
  {
    product: 'Personalized Photo Mug',
    sku: 'PF-GF-001',
    category: 'Gifts',
    price: 399,
    offerPrice: 599,
    currentStock: 80,
    available: 72,
    reserved: 8,
    status: 'In Stock',
    lastUpdated: '01 Sep 2024\n02:10 PM',
    image: 'linear-gradient(135deg, #d6c4ae, #ebdfd0)',
  },
  {
    product: 'Premium Photo Album',
    sku: 'PF-AL-001',
    category: 'Photo Albums',
    price: 1099,
    offerPrice: 1499,
    currentStock: 22,
    available: 20,
    reserved: 2,
    status: 'Low Stock',
    lastUpdated: '31 Aug 2024\n11:00 AM',
    image: 'linear-gradient(135deg, #d9d9d9, #f0f0f0)',
  },
  {
    product: 'Multi Collage Frame',
    sku: 'PF-CG-001',
    category: 'Photo Frames',
    price: 799,
    offerPrice: 1099,
    currentStock: 0,
    available: 0,
    reserved: 0,
    status: 'Out of Stock',
    lastUpdated: '31 Aug 2024\n09:30 AM',
    image: 'linear-gradient(135deg, #c7d7cf, #f0e1d0)',
  },
  {
    product: 'Personalized Gift Box',
    sku: 'PF-GF-002',
    category: 'Gifts',
    price: 499,
    offerPrice: 699,
    currentStock: 5,
    available: 3,
    reserved: 2,
    status: 'Low Stock',
    lastUpdated: '30 Aug 2024\n06:45 PM',
    image: 'linear-gradient(135deg, #d8b691, #f1d5bb)',
  },
];

const statCards = [
  { title: 'Total Products', value: '896', sub: 'All products', icon: <PackageCheck className="h-7 w-7" />, box: 'bg-[#dfece2]', color: 'text-[#2c6847]' },
  { title: 'Total Stock (Units)', value: '12,580', sub: 'Across all products', icon: <ShoppingBag className="h-7 w-7" />, box: 'bg-[#e7ebf7]', color: 'text-[#536bb0]' },
  { title: 'In Stock', value: '9,642', sub: '76.7% of total', icon: <Eye className="h-7 w-7" />, box: 'bg-[#e9f6ee]', color: 'text-[#2d8f55]' },
  { title: 'Low Stock', value: '782', sub: 'Reorder needed', icon: <AlertTriangle className="h-7 w-7" />, box: 'bg-[#fff0df]', color: 'text-[#cf8a1d]' },
  { title: 'Out of Stock', value: '156', sub: 'Need attention', icon: <div className="text-xl font-bold">×</div>, box: 'bg-[#fde7e7]', color: 'text-[#db5f5f]' },
];

const StockDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f4f1] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1c1c1c]">All Stock</h1>
            <p className="mt-2 text-[13px] text-[#6a6a6a]">
              Dashboard <span className="mx-2 text-[#a8a8a8]">&gt;</span>
              <span className="font-medium text-[#2c2c2c]">All Stock</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#1a3c36] px-4 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(26,60,54,0.18)] transition hover:bg-[#214a42]">
              <span className="text-lg">+</span>
              Stock Report
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card, index) => (
            <div key={index} className="rounded-[18px] border border-[#e7e0d8] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${card.box} ${card.color}`}>
                  {card.icon}
                </div>
                <div className="ml-auto text-right">
                  {index === 2 && (
                    <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#2d7b5a]">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      76.7%
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-[13px] font-medium text-[#666666]">{card.title}</div>
                <div className="mt-2 text-[2.2rem] font-bold leading-none tracking-[-0.08em] text-[#1e1e1e]">{card.value}</div>
                <div className="mt-2 text-[10px] text-[#7c7c7c]">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] border border-[#e7e0d8] bg-white p-3 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="h-[46px] w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-10 pr-3 text-[14px] text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
                />
              </div>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                All Categories
                <ChevronDown className="h-4 w-4 text-[#666]" />
              </button>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                All Status
                <ChevronDown className="h-4 w-4 text-[#666]" />
              </button>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                All Stock Status
                <ChevronDown className="h-4 w-4 text-[#666]" />
              </button>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                <Filter className="h-4 w-4 text-[#c69218]" />
                Filter
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                Sort by: Latest
                <ChevronDown className="h-4 w-4 text-[#666]" />
              </button>

              <div className="flex overflow-hidden rounded-xl border border-[#dfe2e5] bg-[#faf9f8]">
                <button className="flex h-[46px] w-[46px] items-center justify-center border-r border-[#dfe2e5] text-[#4d4d4d]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path d="M7 17V7m0 0L3 11m4-4 4 4M17 7v10m0 0 4-4m-4 4-4-4" />
                  </svg>
                </button>
                <button className="flex h-[46px] w-[46px] items-center justify-center text-[#4d4d4d]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="4" rx="1.5" />
                    <rect x="14" y="11" width="7" height="10" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[16px] border border-[#e8e4df]">
            <table className="w-full min-w-[1200px] border-collapse bg-white text-left">
              <thead className="bg-[#f7f4ef] text-[13px] font-semibold text-[#333333]">
                <tr>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4">SKU</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Price</th>
                  <th className="px-4 py-4">Current Stock</th>
                  <th className="px-4 py-4">Available Stock</th>
                  <th className="px-4 py-4">Reserved</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Last Updated</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockRows.map((item, idx) => (
                  <tr key={idx} className="border-t border-[#efefef] text-[13px] text-[#444444]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg border border-[#e7e0d8]" style={{ background: item.image }} />
                        <div>
                          <div className="font-medium text-[#202020]">{item.product}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#5d5d5d]">{item.sku}</td>
                    <td className="px-4 py-4">{item.category}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-[#1d1d1d]">₹{item.price.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-[#7a7a7a] line-through">₹{item.offerPrice.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-4">{item.currentStock}</td>
                    <td className="px-4 py-4">{item.available}</td>
                    <td className="px-4 py-4">{item.reserved}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        item.status === 'In Stock'
                          ? 'bg-[#eaf7ef] text-[#2b7a4b]'
                          : item.status === 'Low Stock'
                            ? 'bg-[#fff2df] text-[#c77f11]'
                            : 'bg-[#fde7e7] text-[#d94d4d]'
                      }`}>
                        <span className={`mr-1.5 h-2 w-2 rounded-full ${
                          item.status === 'In Stock'
                            ? 'bg-[#2b7a4b]'
                            : item.status === 'Low Stock'
                              ? 'bg-[#c77f11]'
                              : 'bg-[#d94d4d]'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-pre-line text-[#5b5b5b]">{item.lastUpdated}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/admin/products/stock-details')}
                          className="rounded-lg border border-[#e7e0d8] bg-white p-2 text-[#4d4d4d] hover:bg-[#f8f6f3]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg border border-[#e7e0d8] bg-white p-2 text-[#4d4d4d] hover:bg-[#f8f6f3]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg border border-[#f1d8d8] bg-[#fff5f5] p-2 text-[#d94848] hover:bg-[#ffeded]">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-[12px] text-[#666]">
            <span>Showing 1 to 10 of 896 products</span>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">&lt;</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d3d36] text-white">1</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">2</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">3</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">4</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">5</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;

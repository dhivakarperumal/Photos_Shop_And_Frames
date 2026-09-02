import React from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  Eye,
  Filter,
  Grid2x2,
  ImageIcon,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';

const categoryCards = [
  { name: 'Photo Frames', products: 245, description: 'Beautiful photo frames in various sizes, styles and materials.', active: true, iconBg: 'bg-[#f4e4d1]', iconColor: 'text-[#a05c2a]' },
  { name: 'Photo Printing', products: 156, description: 'High quality photo printing in multiple sizes and finishes.', active: true, iconBg: 'bg-[#f2dff4]', iconColor: 'text-[#9058a8]' },
  { name: 'Custom Frames', products: 78, description: 'Personalized and custom made frames as per your requirements.', active: true, iconBg: 'bg-[#dfeaf8]', iconColor: 'text-[#3f7db8]' },
  { name: 'Gifts', products: 132, description: 'Unique gifts for every occasion and special moments.', active: true, iconBg: 'bg-[#dff3e3]', iconColor: 'text-[#3a8c62]' },
  { name: 'Photo Albums', products: 68, description: 'Premium photo albums to preserve your memories.', active: true, iconBg: 'bg-[#e9e9e9]', iconColor: 'text-[#5d5d5d]' },
  { name: 'Canvas Prints', products: 54, description: 'Canvas wall art prints for your beautiful memories.', active: true, iconBg: 'bg-[#f4e7d0]', iconColor: 'text-[#99621f]' },
  { name: 'LED Light Frames', products: 45, description: 'Illuminated LED frames to brighten your memories.', active: true, iconBg: 'bg-[#ebf4f0]', iconColor: 'text-[#5e8f7f]' },
  { name: 'Personalized Gifts', products: 63, description: 'Customized gifts with your photos and messages.', active: true, iconBg: 'bg-[#fbe6eb]', iconColor: 'text-[#b15471]' },
  { name: 'Collage Frames', products: 33, description: 'Multi-photo frames and collage frames.', active: true, iconBg: 'bg-[#efe0d0]', iconColor: 'text-[#9c5a3a]' },
  { name: 'Others', products: 22, description: 'Other products and accessories.', active: false, iconBg: 'bg-[#f2f2f2]', iconColor: 'text-[#666666]' },
];

const tableData = [
  { name: 'Photo Frames', description: 'Beautiful photo frames in various sizes, styles and materials.', products: 245, status: 'Active', sortOrder: 1, createdAt: '02 Sep 2024, 10:30 AM' },
  { name: 'Photo Printing', description: 'High quality photo printing in multiple sizes and finishes.', products: 156, status: 'Active', sortOrder: 2, createdAt: '02 Sep 2024, 10:15 AM' },
  { name: 'Custom Frames', description: 'Personalized and custom made frames as per your requirements.', products: 78, status: 'Active', sortOrder: 3, createdAt: '01 Sep 2024, 04:45 PM' },
  { name: 'Gifts', description: 'Unique gifts for every occasion and special moments.', products: 132, status: 'Active', sortOrder: 4, createdAt: '01 Sep 2024, 03:30 PM' },
  { name: 'Photo Albums', description: 'Premium photo albums to preserve your memories.', products: 68, status: 'Active', sortOrder: 5, createdAt: '31 Aug 2024, 02:20 PM' },
];

const statCards = [
  { title: 'Total Categories', value: '10', sub: 'All product categories', icon: <Grid2x2 className="h-7 w-7" />, box: 'bg-[#dfece2]', color: 'text-[#2c6847]' },
  { title: 'Active Categories', value: '9', sub: 'Currently active', icon: <PackageCheck className="h-7 w-7" />, box: 'bg-[#ede0f5]', color: 'text-[#6d4f87]' },
  { title: 'Total Products', value: '896', sub: 'Across all categories', icon: <ShoppingBag className="h-7 w-7" />, box: 'bg-[#e8edf7]', color: 'text-[#526aa8]' },
  { title: 'Total Views', value: '12,580', sub: 'Category page views', icon: <Eye className="h-7 w-7" />, box: 'bg-[#f7ebd9]', color: 'text-[#b28741]' },
];

const AdminCategories = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f1] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1c1c1c]">Categories</h1>
            <p className="mt-2 text-[13px] text-[#6a6a6a]">
              Dashboard <span className="mx-2 text-[#a8a8a8]">&gt;</span>
              <span className="font-medium text-[#2c2c2c]">Categories</span>
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
              <Plus className="h-4 w-4" />
              Add New Category
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => (
            <div key={index} className="rounded-[18px] border border-[#e7e0d8] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${card.box} ${card.color}`}>
                  {card.icon}
                </div>
                <div className="ml-auto text-right">
                  <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#2d7b5a]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {index === 0 ? '10.7%' : index === 1 ? '9.2%' : index === 2 ? '12.4%' : '12.5%'}
                  </div>
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
                  placeholder="Search categories..."
                  className="h-[46px] w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-10 pr-3 text-[14px] text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
                />
              </div>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                All Status
                <ChevronDown className="h-4 w-4 text-[#666]" />
              </button>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                All Parent Categories
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {categoryCards.map((category, index) => (
              <div key={index} className="rounded-[18px] border border-[#e7e0d8] bg-[#fdfdfc] p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl ${category.iconBg}`}>
                    <ImageIcon className={`h-5 w-5 ${category.iconColor}`} />
                  </div>

                  <button className="text-[#7c7c7c] hover:text-[#222]" aria-label="More options">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                </div>

                <div className="text-[16px] font-semibold text-[#1e1e1e]">{category.name}</div>
                <div className="mt-1 text-[13px] text-[#646464]">{category.products} Products</div>

                <div className="mt-3 flex items-center gap-2 text-[12px] text-[#2f7a4a]">
                  <span className="h-2 w-2 rounded-full bg-[#2f7a4a]" />
                  {category.active ? 'Active' : 'Inactive'}
                </div>

                <p className="mt-3 text-[12px] leading-5 text-[#676767]">{category.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-[16px] border border-[#e8e4df]">
            <table className="w-full min-w-[760px] border-collapse bg-white text-left">
              <thead className="bg-[#f7f4ef] text-[13px] font-semibold text-[#333333]">
                <tr>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4">Products</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Sort Order</th>
                  <th className="px-4 py-4">Created At</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, idx) => (
                  <tr key={idx} className="border-t border-[#efefef] text-[13px] text-[#444444]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#f5efe5] text-[#a05c2a]">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-[#202020]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#5d5d5d]">{item.description}</td>
                    <td className="px-4 py-4">{item.products}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-[#eaf7ef] px-2.5 py-1 text-[11px] font-medium text-[#2b7a4b]">
                        <span className="mr-1.5 h-2 w-2 rounded-full bg-[#2b7a4b]" />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{item.sortOrder}</td>
                    <td className="px-4 py-4">{item.createdAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
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
            <span>Showing 1 to 10 of 10 categories</span>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">&lt;</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d3d36] text-white">1</button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666]">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

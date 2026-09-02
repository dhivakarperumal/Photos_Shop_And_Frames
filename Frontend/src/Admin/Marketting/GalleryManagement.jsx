import { useState } from "react";
import {
  Search,
  ChevronDown,
  Filter,
  Download,
  Upload,
  Plus,
  Image as ImageIcon,
  MonitorPlay,
  Users,
  Star,
  Package,
  List,
  LayoutGrid,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ============================================================
   MOCK DATA
   ============================================================ */
const albumsData = [
  {
    id: 1,
    title: "Living Room Frames",
    subtitle: "Beautiful frames for living room decor",
    category: "Photo Frames",
    photos: 28,
    views: "1,245",
    status: "Active",
    createdAt: "02 Sep 2024",
    timeAt: "10:30 AM",
    image: "linear-gradient(135deg, #d3b495, #f2e4d2)",
  },
  {
    id: 2,
    title: "Family Collage Frames",
    subtitle: "Collage frames for family memories",
    category: "Collage Frames",
    photos: 32,
    views: "2,156",
    status: "Active",
    createdAt: "02 Sep 2024",
    timeAt: "09:15 AM",
    image: "linear-gradient(135deg, #a9c7d9, #e9d6c8)",
  },
  {
    id: 3,
    title: "Wedding Frames",
    subtitle: "Elegant frames for wedding photos",
    category: "Photo Frames",
    photos: 25,
    views: "1,890",
    status: "Active",
    createdAt: "01 Sep 2024",
    timeAt: "04:45 PM",
    image: "linear-gradient(135deg, #e8d5c4, #fff)",
  },
  {
    id: 4,
    title: "Baby Photos Collection",
    subtitle: "Cute baby photo frames",
    category: "Photo Frames",
    photos: 18,
    views: "856",
    status: "Active",
    createdAt: "01 Sep 2024",
    timeAt: "03:20 PM",
    image: "linear-gradient(135deg, #f3e1c1, #fff)",
  },
  {
    id: 5,
    title: "Nature & Landscape",
    subtitle: "Beautiful nature and landscape photos",
    category: "Photo Prints",
    photos: 45,
    views: "3,120",
    status: "Active",
    createdAt: "31 Aug 2024",
    timeAt: "11:00 AM",
    image: "linear-gradient(135deg, #2d7b5a, #a0d8c0)",
  },
  {
    id: 6,
    title: "Abstract Art Prints",
    subtitle: "Modern abstract art prints collection",
    category: "Canvas Prints",
    photos: 22,
    views: "1,102",
    status: "Inactive",
    createdAt: "31 Aug 2024",
    timeAt: "09:30 AM",
    image: "linear-gradient(135deg, #d8d8d8, #b0b0b0)",
  },
];

const statCards = [
  {
    title: "Total Albums",
    value: "24",
    subtext: "All gallery albums",
    icon: <Package className="h-6 w-6" />,
    accent: "bg-[#eaf5f0]",
    iconColor: "text-[#2d7b5a]",
  },
  {
    title: "Total Photos",
    value: "358",
    subtext: "Across all albums",
    icon: <ImageIcon className="h-6 w-6" />,
    accent: "bg-[#e8f1f8]",
    iconColor: "text-[#4f88b2]",
  },
  {
    title: "Total Views",
    value: "12,580",
    subtext: "Album & photo views",
    icon: <MonitorPlay className="h-6 w-6" />,
    accent: "bg-[#f1e7f7]",
    iconColor: "text-[#7d5a93]",
  },
  {
    title: "Active Albums",
    value: "21",
    subtext: "Currently active",
    icon: <Users className="h-6 w-6" />,
    accent: "bg-[#fdf3e7]",
    iconColor: "text-[#d4a843]",
  },
  {
    title: "Inactive Albums",
    value: "3",
    subtext: "Currently inactive",
    icon: <Star className="h-6 w-6" />,
    accent: "bg-[#fff0f0]",
    iconColor: "text-[#d04d4d]",
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */
const GalleryManagement = () => {
  const [activeTab, setActiveTab] = useState("albums");
  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="min-h-screen bg-[#f2f3f0] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        
        {/* ── HEADER ── */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1d1b]">
              Gallery Management
            </h1>
            <p className="mt-1 text-[13px] text-[#646464]">
              Dashboard <span className="mx-2 text-[#9a9a9a]">&gt;</span>
              <span className="font-medium text-[#2a2a2a]">Gallery Management</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[14px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[14px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <Link
              to="/admin/gallery/add"
              className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-[#162420] px-4 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#1a3c36]"
            >
              <Plus className="h-4 w-4" />
              Add New Gallery 
            </Link>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#e7e0d8] bg-white p-5 shadow-sm flex items-center gap-4"
            >
              <div
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl ${card.accent} ${card.iconColor}`}
              >
                {card.icon}
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#1f1d1b] leading-tight">
                  {card.title}
                </div>
                <div className="mt-1 text-[1.6rem] font-bold leading-none tracking-tight text-[#1e1e1e]">
                  {card.value}
                </div>
                <div className="mt-1.5 text-[11px] text-[#2d7b5a] font-medium">
                  {card.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="rounded-2xl border border-[#e7e0d8] bg-white p-2 shadow-sm">
          
          {/* TOOLBAR */}
          <div className="p-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-[#f0ebe6]">
            
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
                <input
                  type="text"
                  placeholder="Search albums or photos..."
                  className="h-[42px] w-full rounded-xl border border-[#dfe2e5] bg-white pl-9 pr-3 text-[13px] text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
                />
              </div>

              <div className="relative">
                <select className="h-[42px] appearance-none rounded-xl border border-[#dfe2e5] bg-white pl-3 pr-8 text-[13px] font-medium text-[#2d2d2d] outline-none focus:border-[#d2bc8a] cursor-pointer">
                  <option>All Categories</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>

              <div className="relative">
                <select className="h-[42px] appearance-none rounded-xl border border-[#dfe2e5] bg-white pl-3 pr-8 text-[13px] font-medium text-[#2d2d2d] outline-none focus:border-[#d2bc8a] cursor-pointer">
                  <option>All Status</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>

              <div className="relative">
                <select className="h-[42px] appearance-none rounded-xl border border-[#dfe2e5] bg-white pl-3 pr-8 text-[13px] font-medium text-[#2d2d2d] outline-none focus:border-[#d2bc8a] cursor-pointer">
                  <option>All Albums</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>

              <button className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-white px-3 text-[13px] font-medium text-[#2d2d2d] hover:bg-[#faf9f8]">
                <Filter className="h-4 w-4 text-[#d4a843]" />
                Filter
              </button>
            </div>

            {/* Sort & View Toggles */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="h-[42px] appearance-none rounded-xl border border-[#dfe2e5] bg-white pl-3 pr-8 text-[13px] font-medium text-[#2d2d2d] outline-none cursor-pointer">
                  <option>Sort by: Latest</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>

              <div className="flex overflow-hidden rounded-xl border border-[#dfe2e5] bg-white">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex h-[40px] w-[40px] items-center justify-center border-r border-[#dfe2e5] transition ${
                    viewMode === "table" ? "bg-[#f2f3f0] text-[#1a3c36]" : "text-[#6a6a6a] hover:bg-[#faf9f8]"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`flex h-[40px] w-[40px] items-center justify-center transition ${
                    viewMode === "card" ? "bg-[#162420] text-white" : "text-[#6a6a6a] hover:bg-[#faf9f8]"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-6 px-4 pt-4 border-b border-[#f0ebe6]">
            <button
              onClick={() => setActiveTab("albums")}
              className={`pb-3 text-[14px] font-semibold transition-colors relative ${
                activeTab === "albums" ? "text-[#1a3c36]" : "text-[#7a7a7a] hover:text-[#1a3c36]"
              }`}
            >
              Albums (24)
              {activeTab === "albums" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1a3c36] rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`pb-3 text-[14px] font-semibold transition-colors relative ${
                activeTab === "photos" ? "text-[#1a3c36]" : "text-[#7a7a7a] hover:text-[#1a3c36]"
              }`}
            >
              Photos (358)
              {activeTab === "photos" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1a3c36] rounded-t-full" />
              )}
            </button>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto p-1">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[12px] font-bold text-[#1f1d1b]">
                  <th className="px-4 py-4 whitespace-nowrap">Album</th>
                  <th className="px-4 py-4 whitespace-nowrap">Category</th>
                  <th className="px-4 py-4 whitespace-nowrap">Photos</th>
                  <th className="px-4 py-4 whitespace-nowrap">Views</th>
                  <th className="px-4 py-4 whitespace-nowrap">Status</th>
                  <th className="px-4 py-4 whitespace-nowrap">Created At</th>
                  <th className="px-4 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {albumsData.map((album) => {
                  const isActive = album.status === "Active";
                  return (
                    <tr
                      key={album.id}
                      className="border-b border-[#f0ebe6] align-middle transition-colors hover:bg-[#faf9f8]"
                    >
                      {/* Album Info */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-12 w-[72px] shrink-0 rounded-lg bg-cover bg-center border border-[#e7e0d8] shadow-inner"
                            style={{ background: album.image }}
                          />
                          <div>
                            <div className="text-[14px] font-bold text-[#1f1f1f]">
                              {album.title}
                            </div>
                            <div className="text-[12px] text-[#7a7a7a]">
                              {album.subtitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3 text-[13px] text-[#4d4d4d]">
                        {album.category}
                      </td>

                      {/* Photos */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3 text-[13px] text-[#4d4d4d]">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-[#8a8a8a]" />
                          {album.photos}
                        </div>
                      </td>

                      {/* Views */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3 text-[13px] text-[#4d4d4d]">
                        {album.views}
                      </td>

                      {/* Status */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            isActive
                              ? "bg-[#edf7f1] text-[#2d7b5a]"
                              : "bg-[#fff0f0] text-[#d04d4d]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-[#2d7b5a]" : "bg-[#d04d4d]"
                            }`}
                          />
                          {album.status}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3 text-[12px] text-[#4d4d4d]">
                        <div>{album.createdAt}</div>
                        <div className="text-[#8a8a8a]">{album.timeAt}</div>
                      </td>

                      {/* Actions */}
                      <td className="border-t border-[#f0ebe6] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2d9cf] bg-white text-[#4d4d4d] transition hover:border-[#d0b997] hover:text-[#1a1a1a]">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2d9cf] bg-white text-[#4d4d4d] transition hover:border-[#d0b997] hover:text-[#1a1a1a]">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f3d7d7] bg-[#fff8f8] text-[#d04d4d] transition hover:bg-[#fff0f0]">
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

          {/* PAGINATION */}
          <div className="flex flex-col gap-3 p-4 text-[13px] text-[#6a6a6a] md:flex-row md:items-center md:justify-between border-t border-[#f0ebe6]">
            <span>Showing 1 to 6 of 24 albums</span>

            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#7d7d7d]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#162420] text-white font-medium">
                1
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#4d4d4d] hover:bg-[#faf9f8] font-medium">
                2
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#4d4d4d] hover:bg-[#faf9f8] font-medium">
                3
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#4d4d4d] hover:bg-[#faf9f8] font-medium">
                4
              </button>
              
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#7d7d7d]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GalleryManagement;

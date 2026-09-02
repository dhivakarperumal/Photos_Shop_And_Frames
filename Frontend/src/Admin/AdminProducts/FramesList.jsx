import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Eye,
  Filter,
  Frame,
  Layers,
  LayoutGrid,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Table2,
  Trash2,
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

const FramesList = () => {
  const navigate = useNavigate();
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFrame, setPreviewFrame] = useState(null);
  const [viewMode, setViewMode] = useState("card");

  const fetchFrames = async () => {
    try {
      setLoading(true);
      const url =
        selectedOrientation === "All"
          ? "/frames"
          : `/frames?orientation=${selectedOrientation}`;
      const response = await api.get(url);
      setFrames(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load frames:", err);
      toast.error("Failed to load frame templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, [selectedOrientation]);

  const handleDeleteFrame = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.delete(`/frames/${id}`);
      toast.success("Frame template deleted successfully");
      fetchFrames();
    } catch (err) {
      console.error("Delete frame error:", err);
      toast.error(err.response?.data?.message || "Failed to delete frame");
    }
  };

  const filteredFrames = frames.filter((f) =>
    f.frame_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e8d9ba] bg-[#fffaf2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b6b2d]">
              <Layers className="h-3.5 w-3.5" />
              Frame Template Catalog
            </div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1f1f]">
              Saved Frames
            </h1>
            <p className="mt-1 text-[13px] text-[#6b6b6b]">
              Browse and manage your reusable frame designs, slot positions, and orientations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
  

            <Link
              to="add"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_6px_14px_rgba(26,60,54,0.18)] transition hover:bg-[#214a42]"
            >
              <Plus className="h-4 w-4" />
              Add Frame Setup
            </Link>
          </div>
        </div>

        {/* ================= FILTERS & SEARCH ================= */}
        <div className="mb-6 rounded-[22px] border border-[#e7e0d8] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* SEARCH */}
            <div className="relative w-full max-w-[360px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search frames by name..."
                className="h-11 w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-10 pr-3 text-sm text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
              />
            </div>

            {/* ORIENTATION TABS */}
            <div className="flex flex-wrap items-center gap-2 md:ml-auto">
              {["All", "Portrait", "Landscape", "Square"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedOrientation(tab)}
                  className={`flex h-10 items-center gap-1.5 rounded-xl border px-4 text-xs font-bold transition ${
                    selectedOrientation === tab
                      ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-sm"
                      : "border-[#e6ddd1] bg-[#faf9f8] text-[#555] hover:border-[#d4a553] hover:bg-white"
                  }`}
                >
                  <RotateCw className="h-3 w-3" />
                  {tab}
                </button>
              ))}
              <div className="flex overflow-hidden rounded-xl border border-[#dfe2e5] bg-[#faf9f8]">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex h-10 w-10 items-center justify-center border-r border-[#dfe2e5] ${viewMode === "table" ? "bg-[#1a3c36] text-white" : "text-[#4d4d4d] hover:bg-white"}`}
                  aria-label="Table view"
                  title="Table view"
                >
                  <Table2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`flex h-10 w-10 items-center justify-center ${viewMode === "card" ? "bg-[#1a3c36] text-white" : "text-[#4d4d4d] hover:bg-white"}`}
                  aria-label="Card view"
                  title="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FRAMES GRID ================= */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[22px] border border-[#e7e0d8] bg-white p-12 text-center text-sm text-[#777]">
            Loading frame templates...
          </div>
        ) : filteredFrames.length === 0 ? (
          <div className="rounded-[22px] border-2 border-dashed border-[#e2d9cd] bg-white p-16 text-center shadow-sm">
            <div className="mb-3 text-5xl">🖼️</div>
            <h3 className="text-lg font-bold text-[#333]">No Frame Templates Found</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#888]">
              {searchTerm
                ? "No frames match your search query."
                : `No ${
                    selectedOrientation !== "All" ? selectedOrientation : ""
                  } frame templates exist yet. Create your first frame setup now!`}
            </p>
            <Link
              to="/admin/products/frame-setup"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
            >
              <Plus className="h-4 w-4" />
              Create Frame Setup
            </Link>
          </div>
        ) : (
          {viewMode === "table" ? (
            <div className="overflow-x-auto rounded-[16px] border border-[#e8e4df] bg-white">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead className="bg-[#f7f4ef] text-xs font-semibold text-[#333]">
                  <tr>
                    <th className="px-4 py-4">Frame</th>
                    <th className="px-4 py-4">Orientation</th>
                    <th className="px-4 py-4">Photo Slots</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFrames.map((frame) => (
                    <tr key={frame.id} className="border-t border-[#efefef] text-sm text-[#444]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={frame.frame_image} alt={frame.frame_name} className="h-12 w-12 rounded-lg bg-[#f6f2ec] object-contain" />
                          <div>
                            <div className="font-semibold text-[#202020]">{frame.frame_name}</div>
                            <div className="font-mono text-[10px] text-[#888]">{frame.uuid?.slice(0, 16)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{frame.orientation}</td>
                      <td className="px-4 py-4">{(frame.photo_slots || []).length}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => navigate(`/admin/products/add?frameId=${frame.id}`)} className="rounded-lg bg-[#1a3c36] px-3 py-2 text-xs font-semibold text-white" title="Use in product">Use</button>
                          <button type="button" onClick={() => navigate(`/admin/frames/edit/${frame.id}`)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dcd4c8] bg-white" aria-label="Edit frame" title="Edit frame"><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => handleDeleteFrame(frame.id, frame.frame_name)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600" aria-label="Delete frame" title="Delete frame"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredFrames.map((frame) => {
              const slots = frame.photo_slots || [];

              return (
                <div
                  key={frame.id}
                  className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e7e0d8] bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* FRAME PREVIEW CANVAS */}
                  <div className="relative flex h-[260px] items-center justify-center overflow-hidden bg-[#f6f2ec] p-4">
                    <div className="relative mx-auto max-h-full max-w-full overflow-hidden rounded shadow-sm">
                      <img
                        src={frame.frame_image}
                        alt={frame.frame_name}
                        className="max-h-[220px] w-auto max-w-full object-contain"
                      />

                      {/* PHOTO SLOTS INDICATOR OVERLAY */}
                      {slots.map((slot, idx) => (
                        <div
                          key={slot.id || idx}
                          className="absolute flex items-center justify-center border border-dashed border-blue-500/80 bg-blue-500/20 text-[9px] font-bold text-blue-900 shadow-xs"
                          style={{
                            top: slot.top,
                            left: slot.left,
                            width: slot.width,
                            height: slot.height,
                            borderRadius: slot.shape === "circle" ? "9999px" : "4px",
                          }}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>

                    {/* ORIENTATION BADGE */}
                    <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1a3c36] shadow-xs backdrop-blur-xs">
                      {frame.orientation}
                    </div>

                    {/* SLOTS COUNT BADGE */}
                    <div className="absolute right-3 top-3 rounded-full border border-[#d4a843]/30 bg-[#fff8e7] px-2.5 py-1 text-[10px] font-bold text-[#9b6b2d] shadow-xs">
                      {slots.length} Photo{slots.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* FRAME DETAILS */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="text-base font-bold text-[#1f1f1f] group-hover:text-[#1a3c36]">
                        {frame.frame_name}
                      </h3>
                      <p className="mt-1 font-mono text-[11px] text-[#888]">
                        UUID: {frame.uuid?.slice(0, 16)}...
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {slots.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-[#f4f0eb] px-2 py-0.5 text-[10px] text-[#666]"
                          >
                            {s.name || `Photo ${i + 1}`} ({s.shape})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-5 flex items-center gap-2 border-t border-[#f0ebe3] pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/products/add?frameId=${frame.id}`)}
                        className="flex-1 rounded-xl bg-[#1a3c36] py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#235048]"
                      >
                        Use in Product
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/admin/frames/edit/${frame.id}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#dcd4c8] bg-white text-[#444] transition hover:border-[#d4a553] hover:text-[#1a3c36]"
                        title="Edit frame template"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFrame(frame.id, frame.frame_name)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Delete frame template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        )}
      </div>
    </div>
  );
};

export default FramesList;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Package,
  BookOpen,
  FolderOpen,
  BarChart3,
  BriefcaseBusiness,
} from 'lucide-react';
import api from '../api';

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  const normalizedPath = String(imagePath).trim();
  if (!normalizedPath) return '';
  if (/^https?:\/\//i.test(normalizedPath)) return encodeURI(normalizedPath);

  const cleanPath = normalizedPath.replace(/\\/g, '/');
  let finalPath = cleanPath;

  if (finalPath.startsWith('/')) finalPath = finalPath;
  else if (finalPath.startsWith('uploads/')) finalPath = `/${finalPath}`;
  else if (finalPath.startsWith('images/')) finalPath = `/${finalPath}`;
  else finalPath = `/${finalPath.replace(/^\//, '')}`;

  return encodeURI(`http://localhost:5000${finalPath}`);
};

const normalizeAlbum = (album) => {
  const productImages = (() => {
    if (Array.isArray(album.product_images)) return album.product_images;
    if (typeof album.product_images === 'string') {
      try {
        const parsed = JSON.parse(album.product_images);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  })();

  const firstGalleryImage = productImages.find((image) => Boolean(image));
  const thumbnail = getImageUrl(album.thumbnail_image || firstGalleryImage || '');
  const stock = Number(album.stock_quantity || 0);
  const stockLabel = stock <= 0 ? 'Out of Stock' : stock <= Number(album.minimum_stock || 5) ? 'Low Stock' : 'In Stock';

  return {
    id: album.id || album.product_id,
    name: album.product_name || 'Untitled Album',
    code: album.product_code || album.product_id || 'N/A',
    category: album.category || album.sub_category || 'General',
    size: album.size || 'N/A',
    price: formatCurrency(album.selling_price ?? album.price ?? 0),
    oldPrice: formatCurrency(album.discount_price ?? album.selling_price ?? 0),
    stock,
    stockLabel,
    status: album.status || 'Active',
    views: album.views || 0,
    image: thumbnail || 'linear-gradient(135deg, #f8d7da, #f3d6e4)',
  };
};

const getStatusClasses = (status) => {
  if (status === 'Active') {
    return 'bg-[#dff7ef] text-[#1b7f57]';
  }
  if (status === 'Inactive') {
    return 'bg-[#ffe5e5] text-[#d14d4d]';
  }
  return 'bg-[#f5f5f5] text-[#606060]';
};

const getStockClasses = (stockLabel) => {
  if (stockLabel === 'In Stock') {
    return 'bg-[#dff7ef] text-[#1b7f57]';
  }
  if (stockLabel === 'Low Stock') {
    return 'bg-[#fff2d9] text-[#b26a00]';
  }
  return 'bg-[#ffe5e5] text-[#d14d4d]';
};

const AdminAlbums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAlbums = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/albums');
        const data = Array.isArray(response.data?.data) ? response.data.data : [];

        if (!isMounted) return;

        setAlbums(data.map(normalizeAlbum));
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load albums:', err);
        setError('Unable to load albums right now.');
        setAlbums([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAlbums();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    const activeAlbums = albums.filter((album) => album.status === 'Active').length;
    const lowStock = albums.filter((album) => album.stockLabel === 'Low Stock').length;
    const totalViews = albums.reduce((sum, album) => sum + (Number(album.views) || 0), 0);

    return [
      {
        title: 'Total Albums',
        value: String(totalAlbums),
        change: totalAlbums ? '+ 12.5%' : '0%',
        subtitle: totalAlbums ? 'from last month' : 'No albums yet',
        accent: 'bg-[#e9f6ef]',
        icon: <BookOpen className="h-7 w-7 text-[#1f7a4b]" />,
      },
      {
        title: 'Active Albums',
        value: String(activeAlbums),
        change: activeAlbums ? '+ 8.3%' : '0%',
        subtitle: activeAlbums ? 'from last month' : 'No active items',
        accent: 'bg-[#edf7ff]',
        icon: <FolderOpen className="h-7 w-7 text-[#1f5aa8]" />,
      },
      {
        title: 'Low Stock',
        value: String(lowStock),
        change: lowStock ? 'Needs restock' : 'Healthy',
        subtitle: '',
        accent: 'bg-[#f5ecff]',
        icon: <Package className="h-7 w-7 text-[#7d5ad2]" />,
      },
      {
        title: 'Total Views',
        value: totalViews.toLocaleString(),
        change: '+ 15.2%',
        subtitle: 'from last month',
        accent: 'bg-[#f6edff]',
        icon: <BarChart3 className="h-7 w-7 text-[#7e54c8]" />,
      },
    ];
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch = album.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All Categories' || album.category === category;
      const matchesStatus = status === 'All Status' || album.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [albums, search, category, status]);

  return (
    <div className="min-h-screen bg-[#f2f3f0] p-4 md:p-6">
      <div className="mx-auto max-w-[1550px]">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1d1b]">Albums Management</h1>
            <p className="mt-2 text-[13px] text-[#646464]">
              Dashboard <span className="mx-2 text-[#9a9a9a]">&gt;</span> <span className="font-medium text-[#2a2a2a]">Albums</span>
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
            <button
              type="button"
              onClick={() => navigate('/admin/albums/add')}
              className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#1a3c36] px-4 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(26,60,54,0.18)] transition hover:bg-[#214a42]"
            >
              <Plus className="h-4 w-4" />
              Add New Album
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card, index) => (
            <div key={index} className="rounded-[18px] border border-[#e7e0d8] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${card.accent}`}>
                  {card.icon}
                </div>
                <div className="ml-auto text-right">
                  <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#2d7b5a]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {card.change}
                  </div>
                  {card.subtitle && (
                    <div className="text-[10px] text-[#7c7c7c]">{card.subtitle}</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[13px] font-medium text-[#666666]">{card.title}</div>
                <div className="mt-2 text-[2.2rem] font-bold leading-none tracking-[-0.08em] text-[#1e1e1e]">{card.value}</div>
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
                  placeholder="Search albums..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[46px] w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-10 pr-3 text-[14px] text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
                />
              </div>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                {category}
                <ChevronDown className="h-4 w-4 text-[#666]" />
              </button>

              <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d]">
                {status}
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
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button className="flex h-[46px] w-[46px] items-center justify-center text-[#4d4d4d]">
                  <BriefcaseBusiness className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-[#5d5d5d]">
                Loading albums...
              </div>
            ) : error ? (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-[#b42318]">
                {error}
              </div>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-[#ece9e5] text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6c6c6c]">
                    <th className="px-4 py-3">Album</th>
                    <th className="px-4 py-3">Product Code</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAlbums.map((album) => (
                    <tr key={album.id} className="border-b border-[#f0efec] text-sm text-[#2d2d2d] transition hover:bg-[#fafaf9]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {album.image && !album.image.startsWith('linear-gradient') ? (
                            <img
                              src={album.image}
                              alt={album.name}
                              className="h-14 w-14 rounded-xl border border-[#eaeaea] object-cover shadow-sm"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              className="h-14 w-14 rounded-xl border border-[#eaeaea] shadow-sm"
                              style={{
                                background: album.image && album.image.startsWith('linear-gradient') ? album.image : 'linear-gradient(135deg, #f8d7da, #f3d6e4)',
                              }}
                            />
                          )}
                          <div>
                            <div className="font-semibold text-[#1d1d1d]">{album.name}</div>
                            <div className="text-[12px] text-[#707070]">{album.category} album</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#5d5d5d]">{album.code}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#edf0f7] px-2.5 py-1 text-[11px] font-medium text-[#4d6480]">
                          {album.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">{album.size}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#1e1e1e]">{album.price}</div>
                        <div className="text-[11px] text-[#8e8e8e] line-through">{album.oldPrice}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#1f1f1f]">{album.stock}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStockClasses(album.stockLabel)}`}>
                          {album.stockLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(album.status)}`}>
                          {album.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#1f1f1f] font-medium">{album.views.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg border border-[#dfe2e5] bg-white p-2 text-[#4d4d4d] transition hover:border-[#c9d3df] hover:text-[#1f1f1f]" aria-label="View album">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg border border-[#dfe2e5] bg-white p-2 text-[#4d4d4d] transition hover:border-[#c9d3df] hover:text-[#1f1f1f]" aria-label="Edit album">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg border border-[#dfe2e5] bg-white p-2 text-[#d95a5a] transition hover:border-[#f0c9c9] hover:bg-[#fff2f2]" aria-label="Delete album">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#ece9e5] px-2 pt-4 text-[12px] text-[#737373]">
            <span>Showing 1 to 8 of 186 albums</span>

            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e1df] bg-white text-[#5b5b5b]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a3c36] text-white">1</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e1df] bg-white text-[#5b5b5b]">2</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e1df] bg-white text-[#5b5b5b]">3</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e1df] bg-white text-[#5b5b5b]">4</button>
                <span className="px-1 text-[#7a7a7a]">...</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e1df] bg-white text-[#5b5b5b]">24</button>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e1df] bg-white text-[#5b5b5b]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlbums;

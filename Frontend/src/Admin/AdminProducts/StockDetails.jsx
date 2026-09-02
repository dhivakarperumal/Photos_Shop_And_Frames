import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  LayoutGrid,
  Pencil,
  Package,
  Search,
  ShoppingBag,
  Table2,
  TrendingUp,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const normalizeImageUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('http://') || value.startsWith('https://')) return value;

  const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
  const baseUrl = rawApiUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

const StockDetails = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Stock Status');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('table');
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockValues, setStockValues] = useState([]);
  const [savingStock, setSavingStock] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error('Failed to load stock details:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const stockRows = useMemo(() => products.map((product) => {
    const variants = Array.isArray(product.size_variants) ? product.size_variants : [];
    const currentStock = variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
    const firstVariant = variants[0] || {};
    const status = currentStock === 0 ? 'Out of Stock' : currentStock <= 15 ? 'Low Stock' : 'In Stock';
    const image = normalizeImageUrl(product.product_images?.[0] || product.frame_data?.frame_image || '');

    return {
      id: product.id,
      product: product.product_name || 'Untitled Product',
      sku: product.product_id || '—',
      category: product.category || 'Uncategorized',
      price: Number(firstVariant.offer_price || 0),
      offerPrice: Number(firstVariant.mrp || 0),
      currentStock,
      available: currentStock,
      reserved: 0,
      status,
      lastUpdated: product.updated_at || product.created_at || '',
      image,
      rawData: product,
    };
  }), [products]);

  const categories = [...new Set(stockRows.map((item) => item.category))].sort();
  const filteredRows = stockRows
    .filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = item.product.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All Stock Status' || item.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'stock-high') return b.currentStock - a.currentStock;
      if (sortBy === 'stock-low') return a.currentStock - b.currentStock;
      if (sortBy === 'name') return a.product.localeCompare(b.product);
      return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
    });

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visiblePage = Math.min(currentPage, pageCount);
  const paginatedRows = filteredRows.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  const totalStock = stockRows.reduce((sum, item) => sum + item.currentStock, 0);
  const inStock = stockRows.filter((item) => item.status === 'In Stock').length;
  const lowStock = stockRows.filter((item) => item.status === 'Low Stock').length;
  const outOfStock = stockRows.filter((item) => item.status === 'Out of Stock').length;
  const statCards = [
    { title: 'Total Products', value: String(stockRows.length), sub: 'All products', inc: '10.7%', icon: <Package className="h-7 w-7 text-white" />, iconBg: 'bg-[#22c55e]', waveColor: '#22c55e' },
    { title: 'Total Stock (Units)', value: totalStock.toLocaleString('en-IN'), sub: 'Across all products', inc: '12.4%', icon: <ShoppingBag className="h-7 w-7 text-white" />, iconBg: 'bg-[#f59e0b]', waveColor: '#f59e0b' },
    { title: 'In Stock', value: String(inStock), sub: 'Products available', inc: '15.3%', icon: <Eye className="h-7 w-7 text-white" />, iconBg: 'bg-[#06b6d4]', waveColor: '#06b6d4' },
    { title: 'Low Stock', value: String(lowStock), sub: 'Reorder needed', inc: '9.2%', icon: <AlertTriangle className="h-7 w-7 text-white" />, iconBg: 'bg-[#a855f7]', waveColor: '#a855f7' },
    { title: 'Out of Stock', value: String(outOfStock), sub: 'Need attention', inc: '0%', icon: <Package className="h-7 w-7 text-white" />, iconBg: 'bg-[#f97316]', waveColor: '#f97316' },
  ];

  const openStockEditor = (row) => {
    const variants = Array.isArray(row.rawData?.size_variants) ? row.rawData.size_variants : [];
    setEditingProduct(row);
    setReportOpen(true);
    setStockValues(variants.map((variant) => ({
      ...variant,
      stock: Number(variant.stock) || 0,
    })));
  };

  const openStockReport = () => {
    setEditingProduct(null);
    setStockValues([]);
    setReportOpen(true);
  };

  const handleReportProductChange = (event) => {
    const row = stockRows.find((item) => String(item.id) === event.target.value);
    if (row) openStockEditor(row);
  };

  const updateStockValue = (index, value) => {
    setStockValues((current) => current.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, stock: Math.max(0, Number(value) || 0) } : variant
    )));
  };

  const saveStock = async (event) => {
    event.preventDefault();
    if (!editingProduct) return;

    try {
      setSavingStock(true);
      await api.put(`/products/${editingProduct.id}`, {
        ...editingProduct.rawData,
        size_variants: stockValues,
      });
      toast.success('Stock updated successfully');
      setEditingProduct(null);
      setReportOpen(false);
      const response = await api.get('/products');
      setProducts(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error(error?.response?.data?.message || 'Failed to update stock');
    } finally {
      setSavingStock(false);
    }
  };

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
            {/* <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Upload className="h-4 w-4" />
              Import
            </button> */}
            <button type="button" onClick={openStockReport} className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#1a3c36] px-4 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(26,60,54,0.18)] transition hover:bg-[#214a42]">
              <span className="text-lg">+</span>
              Stock Report
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((stat, index) => (
            <div key={index} className="relative flex min-h-[170px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-1 items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}>{stat.icon}</div>
                <div className="flex flex-col">
                  <p className="mb-1 text-xs font-medium text-gray-600">{stat.title}</p>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <div className="flex flex-col">
                    <div className="mb-1 flex items-center text-xs font-medium text-emerald-600">
                      <TrendingUp size={12} className="mr-1" />
                      <span>{stat.inc}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{stat.sub}</p>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-full overflow-hidden">
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-full w-full opacity-40" style={{ color: stat.waveColor }} fill="currentColor">
                  <path d="M0,10 C30,25 70,0 100,10 L100,20 L0,20 Z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] border border-[#e7e0d8] bg-white p-3 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
                  placeholder="Search products..."
                  className="h-[46px] w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] pl-10 pr-3 text-[14px] text-[#2d2d2d] outline-none placeholder:text-[#8a8a8a] focus:border-[#d2bc8a]"
                />
              </div>

              <div className="flex w-full flex-wrap items-center justify-end gap-3 lg:ml-auto">
              <select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setCurrentPage(1); }} className="h-[46px] rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d] outline-none">
                <option>All Categories</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>

              <select value={selectedStatus} onChange={(event) => { setSelectedStatus(event.target.value); setCurrentPage(1); }} className="h-[46px] rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d] outline-none">
                <option>All Stock Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }} className="h-[46px] rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 text-[14px] font-medium text-[#2d2d2d] outline-none">
                <option value="latest">Sort by: Latest</option>
                <option value="name">Name: A to Z</option>
                <option value="stock-high">Stock: High to Low</option>
                <option value="stock-low">Stock: Low to High</option>
              </select>

              <div className="flex overflow-hidden rounded-xl border border-[#dfe2e5] bg-[#faf9f8]">
                <button type="button" onClick={() => setViewMode('table')} className={`flex h-[46px] w-[46px] items-center justify-center border-r border-[#dfe2e5] ${viewMode === 'table' ? 'bg-[#1a3c36] text-white' : 'text-[#4d4d4d] hover:bg-white'}`} aria-label="Table view" title="Table view">
                  <Table2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setViewMode('card')} className={`flex h-[46px] w-[46px] items-center justify-center ${viewMode === 'card' ? 'bg-[#1a3c36] text-white' : 'text-[#4d4d4d] hover:bg-white'}`} aria-label="Card view" title="Card view">
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[#777]">Loading stock details...</div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#e6ddd1] bg-[#faf9f8] py-16 text-center text-sm text-[#777]">No stock records found.</div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {paginatedRows.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#e7e0d8] bg-[#fdfdfc] p-4 shadow-sm">
                  <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-lg bg-[#f5f1ec]">
                    {item.image ? <img src={item.image} alt={item.product} className="h-full w-full object-contain" /> : <Package className="h-12 w-12 text-[#b5a998]" />}
                  </div>
                  <h3 className="truncate text-base font-semibold text-[#1f1f1f]">{item.product}</h3>
                  <p className="mt-1 font-mono text-xs text-[#7a7a7a]">{item.sku}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#1e1e1e]">Stock: {item.currentStock}</span>
                    <span className="text-[#666]">{item.category}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'In Stock' ? 'bg-[#edf7f1] text-[#2d7b5a]' : item.status === 'Low Stock' ? 'bg-[#fff2df] text-[#c77f11]' : 'bg-[#fde7e7] text-[#d94d4d]'}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />{item.status}
                    </span>
                    <button type="button" onClick={() => openStockEditor(item)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2d9cf] bg-white text-[#4d4d4d] hover:border-[#d0b997] hover:text-[#1a1a1a]" aria-label={`Edit stock for ${item.product}`} title="Edit stock">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                {paginatedRows.map((item) => (
                  <tr key={item.id} className="border-t border-[#efefef] text-[13px] text-[#444444]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-[#e7e0d8] bg-[#f5f1ec]">
                          {item.image ? <img src={item.image} alt={item.product} className="h-full w-full object-contain" /> : <Package className="h-5 w-5 text-[#b5a998]" />}
                        </div>
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
                        <button type="button" onClick={() => openStockEditor(item)} className="rounded-lg border border-[#e7e0d8] bg-white p-2 text-[#4d4d4d] hover:bg-[#f8f6f3]" aria-label={`Edit stock for ${item.product}`} title="Edit stock">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          <div className="mt-4 flex items-center justify-between text-[12px] text-[#666]">
            <span>Showing {filteredRows.length === 0 ? 0 : ((visiblePage - 1) * pageSize) + 1} to {Math.min(visiblePage * pageSize, filteredRows.length)} of {filteredRows.length} products</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={visiblePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666] disabled:cursor-not-allowed disabled:opacity-40">&lt;</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button type="button" key={page} onClick={() => setCurrentPage(page)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${visiblePage === page ? 'bg-[#1d3d36] text-white' : 'border border-[#e7e0d8] bg-white text-[#666]'}`}>{page}</button>
              ))}
              <button type="button" disabled={visiblePage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e0d8] bg-white text-[#666] disabled:cursor-not-allowed disabled:opacity-40">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={saveStock} className="w-full max-w-lg rounded-2xl border border-[#e7e0d8] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#f0ebe3] pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#777]">Stock report</p>
                <h2 className="mt-1 text-xl font-bold text-[#202020]">Select product and update stock</h2>
              </div>
              <button type="button" onClick={() => { setEditingProduct(null); setReportOpen(false); }} className="text-2xl leading-none text-[#777] hover:text-[#222]" aria-label="Close stock editor">&times;</button>
            </div>

            <label className="mb-4 block text-sm font-semibold text-[#333]">
              Product
              <select value={editingProduct?.id || ''} onChange={handleReportProductChange} className="mt-2 h-11 w-full rounded-lg border border-[#dfe2e5] bg-white px-3 text-sm font-normal outline-none focus:border-[#1a3c36]">
                <option value="">Select a product</option>
                {stockRows.map((row) => <option key={row.id} value={row.id}>{row.product} ({row.sku})</option>)}
              </select>
            </label>

            {!editingProduct ? (
              <p className="rounded-xl bg-[#faf9f8] p-4 text-sm text-[#666]">Select a product to view and update its stock.</p>
            ) : stockValues.length === 0 ? (
              <p className="rounded-xl bg-[#faf9f8] p-4 text-sm text-[#666]">No size variants are available for this product.</p>
            ) : (
              <div className="space-y-3">
                {stockValues.map((variant, index) => (
                  <label key={index} className="flex items-center justify-between gap-4 rounded-xl border border-[#e7e0d8] bg-[#faf9f8] p-3">
                    <span>
                      <span className="block text-sm font-semibold text-[#222]">{variant.size || `Size ${index + 1}`}</span>
                      <span className="text-xs text-[#777]">Current stock: {variant.stock}</span>
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(event) => updateStockValue(index, event.target.value)}
                      className="h-10 w-24 rounded-lg border border-[#dfe2e5] bg-white px-3 text-right text-sm font-semibold outline-none focus:border-[#1a3c36]"
                      aria-label={`Stock for ${variant.size || `size ${index + 1}`}`}
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setEditingProduct(null); setReportOpen(false); }} className="rounded-xl border border-[#dfe2e5] bg-white px-4 py-2 text-sm font-semibold text-[#555] hover:bg-[#faf9f8]">Cancel</button>
              <button type="submit" disabled={savingStock || !editingProduct || stockValues.length === 0} className="rounded-xl bg-[#1a3c36] px-5 py-2 text-sm font-semibold text-white hover:bg-[#214a42] disabled:cursor-not-allowed disabled:opacity-60">
                {savingStock ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StockDetails;

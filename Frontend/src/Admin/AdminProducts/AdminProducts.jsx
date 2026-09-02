import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownUp,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Layers,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const initialMockProducts = [
  {
    id: 'mock-1',
    name: 'Classic Wooden Frame',
    code: 'PF-WD-001',
    category: 'Photo Frames',
    price: '₹899',
    oldPrice: '₹1,299',
    stock: 52,
    stockLabel: 'In Stock',
    status: 'Active',
    views: 1245,
    image: 'linear-gradient(135deg, #d3b495, #f2e4d2)',
  },
  {
    id: 'mock-2',
    name: 'Black Matt Frame',
    code: 'PF-BK-002',
    category: 'Photo Frames',
    price: '₹699',
    oldPrice: '₹999',
    stock: 18,
    stockLabel: 'Low Stock',
    status: 'Active',
    views: 978,
    image: 'linear-gradient(135deg, #d8d8d8, #b0b0b0)',
  },
  {
    id: 'mock-3',
    name: 'Canvas Wall Print',
    code: 'PF-CV-001',
    category: 'Photo Printing',
    price: '₹1,299',
    oldPrice: '₹1,799',
    stock: 35,
    stockLabel: 'In Stock',
    status: 'Active',
    views: 2156,
    image: 'linear-gradient(135deg, #a9c7d9, #e9d6c8)',
  },
  {
    id: 'mock-4',
    name: 'LED Light Frame',
    code: 'PF-LED-001',
    category: 'Custom Frames',
    price: '₹1,599',
    oldPrice: '₹2,199',
    stock: 12,
    stockLabel: 'Low Stock',
    status: 'Active',
    views: 856,
    image: 'linear-gradient(135deg, #d6bf9a, #f3e1c1)',
  },
  {
    id: 'mock-5',
    name: 'Personalized Photo Mug',
    code: 'PF-GE-001',
    category: 'Gifts',
    price: '₹399',
    oldPrice: '₹599',
    stock: 80,
    stockLabel: 'In Stock',
    status: 'Active',
    views: 1789,
    image: 'linear-gradient(135deg, #d6c4ae, #ebdfd0)',
  },
];

const AdminProducts = () => {
  const navigate = useNavigate();
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data?.data && res.data.data.length > 0) {
        // Map database products to table representation
        const mapped = res.data.data.map((p) => {
          const firstVariant = p.size_variants?.[0] || {};
          const totalStock = (p.size_variants || []).reduce(
            (acc, curr) => acc + (Number(curr.stock) || 0),
            0
          );
          const minOfferPrice = firstVariant.offer_price ? `₹${firstVariant.offer_price}` : '₹--';
          const minMrp = firstVariant.mrp ? `₹${firstVariant.mrp}` : '';

          return {
            id: p.id,
            uuid: p.uuid,
            name: p.product_name,
            code: p.product_id,
            category: p.category,
            price: minOfferPrice,
            oldPrice: minMrp,
            stock: totalStock,
            stockLabel: totalStock <= 15 ? 'Low Stock' : 'In Stock',
            status: p.status || 'Active',
            views: 0,
            image: p.frame_data?.frame_image || p.product_images?.[0] || '',
            isDbProduct: true,
          };
        });
        setProductsList(mapped);
      } else {
        setProductsList(initialMockProducts);
      }
    } catch (err) {
      console.warn('Could not fetch products from database, using mock items:', err);
      setProductsList(initialMockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id, isDb) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    if (isDb) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    } else {
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      toast.success('Mock product removed');
    }
  };

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    {
      title: 'Total Products',
      value: String(productsList.length),
      trend: '+ 10.7%',
      trendText: 'from last month',
      accent: 'bg-[#d9ead9]',
      iconColor: 'text-[#2a5e3d]',
      icon: <PackageCheck className="h-7 w-7" />,
    },
    {
      title: 'Active Products',
      value: String(productsList.filter((p) => p.status === 'Active').length),
      trend: '+ 82.8%',
      trendText: 'of total',
      accent: 'bg-[#f1e7f7]',
      iconColor: 'text-[#7d5a93]',
      icon: <ShoppingBag className="h-7 w-7" />,
    },
    {
      title: 'Total Views',
      value: '12,580',
      trend: '+ 12.5%',
      trendText: 'from last month',
      accent: 'bg-[#e8eefb]',
      iconColor: 'text-[#7a5fc4]',
      icon: <Eye className="h-7 w-7" />,
    },
    {
      title: 'Low Stock',
      value: String(productsList.filter((p) => p.stock <= 18).length),
      trend: 'Products low on stock',
      trendText: '',
      accent: 'bg-[#dfeff8]',
      iconColor: 'text-[#4f88b2]',
      icon: <Star className="h-7 w-7" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f3f0] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        {/* ================= TOP TOOLBAR ================= */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1d1b]">Products</h1>
            <p className="mt-2 text-[13px] text-[#646464]">
              Dashboard <span className="mx-2 text-[#9a9a9a]">&gt;</span> <span className="font-medium text-[#2a2a2a]">Products</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d9d6d2] bg-white px-4 text-[15px] font-medium text-[#2d2d2d] shadow-sm transition hover:bg-[#faf7f3]">
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* ADD FRAME SETUP BUTTON (PLACED NEAR ADD NEW PRODUCT) */}
            <Link
              to="/admin/products/frame-setup"
              className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#d4a843] bg-[#fffbf2] px-4 text-[15px] font-semibold text-[#9b6b2d] shadow-sm transition hover:bg-[#fff5e0]"
            >
              <Layers className="h-4 w-4 text-[#d4a843]" />
              Add Frame Setup
            </Link>

            {/* ADD NEW PRODUCT BUTTON */}
            <Link
              to="/admin/products/add"
              className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#1a3c36] px-4 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(26,60,54,0.18)] transition hover:bg-[#214a42]"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* ================= STAT CARDS ================= */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => (
            <div key={index} className="rounded-[18px] border border-[#e7e0d8] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${card.accent} ${card.iconColor}`}>
                  {card.icon}
                </div>
                <div className="ml-auto text-right">
                  <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#2d7b5a]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {card.trend}
                  </div>
                  {card.trendText && (
                    <div className="text-[10px] text-[#7c7c7c]">{card.trendText}</div>
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

        {/* ================= TABLE CARD ================= */}
        <div className="rounded-[18px] border border-[#e7e0d8] bg-white p-3 shadow-[0_1px_0_rgba(16,24,40,0.02)]">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name or code..."
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
                  <ArrowDownUp className="h-4 w-4" />
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

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#f0e6d2] text-left text-sm font-semibold text-[#3d3d3d]">
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Price</th>
                  <th className="px-4 py-4">Stock</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Views</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product, index) => {
                  const lowStock = product.stock <= 18;
                  const stockClass = lowStock ? 'bg-[#fff0f0] text-[#d04d4d]' : 'bg-[#eaf7ee] text-[#2d7b5a]';

                  return (
                    <tr key={product.id || index} className="border-t border-[#f0ebe6] align-middle">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#e7e0d8] bg-[#f5f1ec]">
                            {product.image && product.image.startsWith('http') || product.image?.startsWith('/') ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div
                                className="h-11 w-11 rounded-lg border border-[#d9c5a7] shadow-inner"
                                style={{ background: product.image || '#eee' }}
                              />
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-[#1f1f1f]">{product.name}</div>
                            <div className="text-sm font-mono text-[#7a7a7a]">{product.code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#4d4d4d]">{product.category}</td>

                      <td className="px-4 py-4">
                        <div className="text-lg font-bold text-[#1e1e1e]">{product.price}</div>
                        {product.oldPrice && (
                          <div className="text-xs text-[#8a8a8a] line-through">{product.oldPrice}</div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-[#333]">{product.stock}</div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stockClass}`}>
                            {product.stockLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7f1] px-2.5 py-1 text-xs font-semibold text-[#2d7b5a]">
                          <span className="h-2 w-2 rounded-full bg-[#2d7b5a]" />
                          {product.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-[#313131]">{product.views}</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2d9cf] bg-white text-[#4d4d4d] transition hover:border-[#d0b997] hover:text-[#1a1a1a]"
                            aria-label="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.isDbProduct)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#f3d7d7] bg-[#fff8f8] text-[#d04d4d] transition hover:bg-[#fff0f0]"
                            aria-label="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#efebe7] pt-4 text-sm text-[#6a6a6a] md:flex-row md:items-center md:justify-between">
            <span>Showing {filteredProducts.length} of {productsList.length} products</span>

            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#7d7d7d]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173b35] text-white">
                1
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dbd2] bg-white text-[#7d7d7d]">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

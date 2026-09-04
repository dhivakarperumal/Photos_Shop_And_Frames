import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImagePlus, Trash2 } from 'lucide-react';
import api from '../api';

const albumProduct = {
  productId: 'ALB001',
  productName: 'Premium Wedding Photo Album',
  productCode: 'ALB-001',
  category: 'Albums',
  subCategory: 'Wedding Album',
  brand: 'Q Frames',
  albumType: 'Photo Album',
  occasion: 'Wedding',
  theme: 'Classic',
  size: '12 x 18 Inches',
  width: '12 Inches',
  height: '18 Inches',
  orientation: 'Landscape',
  totalPages: 40,
  sheetCount: 20,
  pageMaterial: 'Premium Photo Paper',
  pageThickness: '300 GSM',
  coverType: 'Hard Cover',
  coverMaterial: 'Leatherette',
  coverFinish: 'Matte',
  coverColor: 'Brown',
  printingType: 'Digital Printing',
  printQuality: 'High Definition',
  printingSides: 'Both Sides',
  bindingType: 'Lay Flat Binding',
  thumbnailImage: '',
  productImages: ['', '', ''],
  costPrice: 800,
  sellingPrice: 1200,
  discountPrice: 999,
  discountPercentage: 17,
  stockQuantity: 25,
  minimumStock: 5,
  stockStatus: 'In Stock',
  shortDescription: 'Premium quality customizable photo album.',
  description: '',
  customizationAvailable: true,
  customerNamePrinting: true,
  photoUploadRequired: true,
  customCoverDesign: true,
  estimatedDeliveryDays: 7,
  status: 'Active',
  featuredProduct: true,
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  createdBy: 'Admin',
  createdAt: '',
  updatedBy: 'Admin',
  updatedAt: '',
};

const fieldStyle = 'w-full rounded-xl border border-[#dfe2e5] bg-[#faf9f8] px-3 py-2.5 text-sm text-[#1f1f1f] outline-none focus:border-[#1a3c36]';

const AddAlbum = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editAlbumId = queryParams.get('edit');
  const viewAlbumId = queryParams.get('view');
  const mode = viewAlbumId ? 'view' : editAlbumId ? 'edit' : 'create';
  const [formData, setFormData] = useState(albumProduct);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    const fetchAlbumForEdit = async (albumId) => {
      try {
        const response = await api.get(`/albums/${albumId}`);
        const album = response?.data?.data || {};

        const productImages = Array.isArray(album.product_images)
          ? album.product_images
          : typeof album.product_images === 'string'
            ? JSON.parse(album.product_images || '[]')
            : [];

        setFormData({
          ...albumProduct,
          productId: album.product_id || album.productId || 'ALB001',
          productName: album.product_name || album.productName || '',
          productCode: album.product_code || album.productCode || '',
          category: album.category || 'Albums',
          subCategory: album.sub_category || album.subCategory || '',
          brand: album.brand || '',
          albumType: album.album_type || album.albumType || '',
          occasion: album.occasion || '',
          theme: album.theme || '',
          size: album.size || '',
          width: album.width || '',
          height: album.height || '',
          orientation: album.orientation || 'Landscape',
          totalPages: album.total_pages ?? album.totalPages ?? 0,
          sheetCount: album.sheet_count ?? album.sheetCount ?? 0,
          pageMaterial: album.page_material || album.pageMaterial || '',
          pageThickness: album.page_thickness || album.pageThickness || '',
          coverType: album.cover_type || album.coverType || '',
          coverMaterial: album.cover_material || album.coverMaterial || '',
          coverFinish: album.cover_finish || album.coverFinish || '',
          coverColor: album.cover_color || album.coverColor || '',
          printingType: album.printing_type || album.printingType || '',
          printQuality: album.print_quality || album.printQuality || '',
          printingSides: album.printing_sides || album.printingSides || '',
          bindingType: album.binding_type || album.bindingType || '',
          thumbnailImage: album.thumbnail_image || album.thumbnailImage || '',
          productImages: Array.isArray(productImages) ? productImages : [],
          costPrice: album.cost_price ?? album.costPrice ?? 0,
          sellingPrice: album.selling_price ?? album.sellingPrice ?? 0,
          discountPrice: album.discount_price ?? album.discountPrice ?? 0,
          discountPercentage: album.discount_percentage ?? album.discountPercentage ?? 0,
          stockQuantity: album.stock_quantity ?? album.stockQuantity ?? 0,
          minimumStock: album.minimum_stock ?? album.minimumStock ?? 0,
          stockStatus: album.stock_status || album.stockStatus || 'In Stock',
          shortDescription: album.short_description || album.shortDescription || '',
          description: album.description || '',
          customizationAvailable: Boolean(album.customization_available ?? album.customizationAvailable ?? false),
          customerNamePrinting: Boolean(album.customer_name_printing ?? album.customerNamePrinting ?? false),
          photoUploadRequired: Boolean(album.photo_upload_required ?? album.photoUploadRequired ?? false),
          customCoverDesign: Boolean(album.custom_cover_design ?? album.customCoverDesign ?? false),
          estimatedDeliveryDays: album.estimated_delivery_days ?? album.estimatedDeliveryDays ?? 0,
          status: album.status || 'Active',
          featuredProduct: Boolean(album.featured_product ?? album.featuredProduct ?? false),
          metaTitle: album.meta_title || album.metaTitle || '',
          metaDescription: album.meta_description || album.metaDescription || '',
          keywords: Array.isArray(album.keywords) ? album.keywords : [],
        });
      } catch (error) {
        console.error('Failed to load album for edit:', error);
      }
    };

    const fetchNextProductId = async () => {
      try {
        const response = await api.get('/albums/next-id');
        const nextId = response?.data?.data || 'ALB001';
        const nextCode = nextId.includes('-') ? nextId : nextId.replace('ALB', 'ALB-');

        setFormData((prev) => ({
          ...prev,
          productId: nextId,
          productCode: nextCode,
        }));
      } catch (error) {
        console.error('Failed to get next album ID:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const allCategories = Array.isArray(response?.data?.data) ? response.data.data : [];
        const albumCategories = allCategories.filter((category) => {
          const categoryType = String(category.category_type || category.categoryType || '').trim().toLowerCase();
          return categoryType === 'albums' || categoryType === 'album';
        });

        setCategories(albumCategories);

        if (albumCategories.length && !formData.category) {
          setFormData((prev) => ({
            ...prev,
            category: albumCategories[0].category_name,
            subCategory: Array.isArray(albumCategories[0].sub_categories) ? albumCategories[0].sub_categories[0] || '' : '',
          }));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    if (mode === 'create') {
      fetchNextProductId();
    }

    if (mode === 'edit' || mode === 'view') {
      const albumId = editAlbumId || viewAlbumId;
      if (albumId) {
        fetchAlbumForEdit(albumId);
      }
    }

    fetchCategories();
  }, [editAlbumId, viewAlbumId, mode]);

  const selectedCategory = categories.find((category) => category.category_name === formData.category) || categories[0] || null;
  const subCategoryOptions = Array.isArray(selectedCategory?.sub_categories) ? selectedCategory.sub_categories : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'category') {
      const matchedCategory = categories.find((category) => category.category_name === value);
      const firstSubCategory = Array.isArray(matchedCategory?.sub_categories) ? matchedCategory.sub_categories[0] || '' : '';

      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: firstSubCategory,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (event, type = 'thumbnail') => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (type === 'thumbnail') {
      setUploadingThumb(true);
    } else {
      setUploadingGallery(true);
    }

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const form = new FormData();
        form.append('folder', 'albums');
        form.append('file', file);

        const response = await api.post('/upload', form);
        const uploadedUrl = response?.data?.url || response?.data?.urls?.[0] || '';

        if (uploadedUrl) {
          uploadedUrls.push(uploadedUrl);
        }
      }

      if (type === 'thumbnail') {
        const [firstUrl] = uploadedUrls;
        if (firstUrl) {
          setFormData((prev) => ({ ...prev, thumbnailImage: firstUrl }));
        }
      } else if (typeof type === 'string' && type.startsWith('gallery-replace-')) {
        const replaceIndex = Number(type.replace('gallery-replace-', ''));
        const [firstUrl] = uploadedUrls;
        if (firstUrl && Number.isInteger(replaceIndex)) {
          setFormData((prev) => ({
            ...prev,
            productImages: prev.productImages.map((image, index) => index === replaceIndex ? firstUrl : image),
          }));
        }
      } else {
        setFormData((prev) => {
          const productImages = Array.isArray(prev.productImages) ? [...prev.productImages] : [];

          uploadedUrls.forEach((url) => {
            const index = productImages.findIndex((image) => !image);
            if (index >= 0) {
              productImages[index] = url;
            } else {
              productImages.push(url);
            }
          });

          return { ...prev, productImages: productImages.slice(0, 6) };
        });
      }
    } catch (error) {
      console.error(error);
      alert('Image upload failed.');
    } finally {
      event.target.value = '';
      if (type === 'thumbnail') setUploadingThumb(false);
      else setUploadingGallery(false);
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnailImage: '' }));
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        product_id: formData.productId,
        product_name: formData.productName,
        product_code: formData.productCode,
        category: formData.category,
        sub_category: formData.subCategory,
        brand: formData.brand,
        album_type: formData.albumType,
        occasion: formData.occasion,
        theme: formData.theme,
        size: formData.size,
        width: formData.width,
        height: formData.height,
        orientation: formData.orientation,
        total_pages: Number(formData.totalPages),
        sheet_count: Number(formData.sheetCount),
        page_material: formData.pageMaterial,
        page_thickness: formData.pageThickness,
        cover_type: formData.coverType,
        cover_material: formData.coverMaterial,
        cover_finish: formData.coverFinish,
        cover_color: formData.coverColor,
        printing_type: formData.printingType,
        print_quality: formData.printQuality,
        printing_sides: formData.printingSides,
        binding_type: formData.bindingType,
        thumbnail_image: formData.thumbnailImage,
        product_images: formData.productImages,
        cost_price: Number(formData.costPrice),
        selling_price: Number(formData.sellingPrice),
        discount_price: Number(formData.discountPrice),
        discount_percentage: Number(formData.discountPercentage),
        stock_quantity: Number(formData.stockQuantity),
        minimum_stock: Number(formData.minimumStock),
        stock_status: formData.stockStatus,
        short_description: formData.shortDescription,
        description: formData.description,
        customization_available: formData.customizationAvailable,
        customer_name_printing: formData.customerNamePrinting,
        photo_upload_required: formData.photoUploadRequired,
        custom_cover_design: formData.customCoverDesign,
        estimated_delivery_days: Number(formData.estimatedDeliveryDays),
        status: formData.status,
        featured_product: formData.featuredProduct,
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        keywords: formData.keywords,
        created_by: 'Admin',
        updated_by: 'Admin',
      };

      if (mode === 'edit' && editAlbumId) {
        await api.put(`/albums/${editAlbumId}`, payload);
      } else {
        await api.post('/albums', payload);
      }

      navigate('/admin/albums');
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to save album.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1d1b]">
              {mode === 'view' ? 'View Album' : mode === 'edit' ? 'Edit Album' : 'Add New Album'}
            </h1>
            <p className="mt-2 text-[13px] text-[#646464]">
              Dashboard <span className="mx-2 text-[#9a9a9a]">&gt;</span> <span className="font-medium text-[#2a2a2a]">Albums</span> <span className="mx-2 text-[#9a9a9a]">&gt;</span> <span className="font-medium text-[#2a2a2a]">Add New Album</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/albums')}
            className="rounded-xl border border-[#dfe2e5] bg-white px-4 py-2.5 text-sm font-medium text-[#2d2d2d] shadow-sm"
          >
            ← Back to Albums
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[20px] border border-[#e7e0d8] bg-white p-5 shadow-sm">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Basic Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Product Name *</span>
                    <input name="productName" value={formData.productName} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Product Code *</span>
                    <input name="productCode" value={formData.productCode} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Category *</span>
                    <select name="category" value={formData.category} onChange={handleChange} className={fieldStyle}>
                      {categories.length ? (
                        categories.map((category) => (
                          <option key={category.category_id || category.category_name} value={category.category_name}>
                            {category.category_name}
                          </option>
                        ))
                      ) : (
                        <option value="Albums">Albums</option>
                      )}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Sub Category</span>
                    <select name="subCategory" value={formData.subCategory} onChange={handleChange} className={fieldStyle}>
                      {subCategoryOptions.length ? (
                        subCategoryOptions.map((subCategory) => (
                          <option key={subCategory} value={subCategory}>{subCategory}</option>
                        ))
                      ) : (
                        <option value="">No sub category</option>
                      )}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Brand</span>
                    <input name="brand" value={formData.brand} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Album Type</span>
                    <input name="albumType" value={formData.albumType} onChange={handleChange} className={fieldStyle} />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Pages Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Total Pages</span>
                    <input name="totalPages" type="number" value={formData.totalPages} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Sheet Count</span>
                    <input name="sheetCount" type="number" value={formData.sheetCount} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Page Material</span>
                    <input name="pageMaterial" value={formData.pageMaterial} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Page Thickness</span>
                    <input name="pageThickness" value={formData.pageThickness} onChange={handleChange} className={fieldStyle} />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Product Images</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Thumbnail Image</span>
                    <input id="album-thumbnail-upload" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="sr-only" />
                    {uploadingThumb && <span className="text-xs text-[#1a3c36]">Uploading...</span>}
                    <div className="relative mt-2 h-28 w-28">
                      {formData.thumbnailImage ? (
                        <img src={formData.thumbnailImage} alt="thumb" className="h-full w-full rounded-xl border border-[#dfe2e5] object-cover" />
                      ) : (
                        <label htmlFor="album-thumbnail-upload" className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#cbd4d0] bg-white text-[#6e8379] hover:border-[#1a3c36] hover:text-[#1a3c36]"><ImagePlus className="h-5 w-5" /><span className="text-[10px] font-semibold">Add image</span></label>
                      )}
                      {formData.thumbnailImage && <div className="absolute right-1 top-1 flex gap-1"><label htmlFor="album-thumbnail-upload" title="Replace thumbnail" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#1a3c36] text-white shadow-md hover:bg-[#28574e]"><ImagePlus className="h-3.5 w-3.5" /></label><button type="button" onClick={removeThumbnail} title="Delete thumbnail" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b42318] text-white shadow-md hover:bg-[#8e1c14]"><Trash2 className="h-3.5 w-3.5" /></button></div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Product Images</span>
                    <input id="album-gallery-upload" type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'gallery')} className="sr-only" />
                    {uploadingGallery && <span className="text-xs text-[#1a3c36]">Uploading...</span>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.productImages.map((img, idx) => (img ? <div key={`${img}-${idx}`} className="relative h-20 w-20"><input id={`album-gallery-replace-${idx}`} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, `gallery-replace-${idx}`)} className="sr-only" /><img src={img} alt={`gallery-${idx}`} className="h-full w-full rounded-xl border border-[#dfe2e5] object-cover" /><div className="absolute right-1 top-1 flex gap-1"><label htmlFor={`album-gallery-replace-${idx}`} title="Replace image" className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#1a3c36] text-white shadow-md hover:bg-[#28574e]"><ImagePlus className="h-3 w-3" /></label><button type="button" onClick={() => removeGalleryImage(idx)} title="Delete image" className="flex h-6 w-6 items-center justify-center rounded-full bg-[#b42318] text-white shadow-md hover:bg-[#8e1c14]"><Trash2 className="h-3 w-3" /></button></div></div> : null))}
                      <label htmlFor="album-gallery-upload" title="Add gallery images" className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#cbd4d0] bg-white text-[#6e8379] hover:border-[#1a3c36] hover:text-[#1a3c36]"><ImagePlus className="h-4 w-4" /><span className="text-[10px] font-semibold">Add</span></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Album Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Occasion</span>
                    <input name="occasion" value={formData.occasion} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Theme</span>
                    <input name="theme" value={formData.theme} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Cover Type</span>
                    <input name="coverType" value={formData.coverType} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Cover Material</span>
                    <input name="coverMaterial" value={formData.coverMaterial} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Cover Finish</span>
                    <input name="coverFinish" value={formData.coverFinish} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Cover Color</span>
                    <input name="coverColor" value={formData.coverColor} onChange={handleChange} className={fieldStyle} />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Size & Dimensions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Size</span>
                    <input name="size" value={formData.size} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Orientation</span>
                    <select name="orientation" value={formData.orientation} onChange={handleChange} className={fieldStyle}>
                      <option>Landscape</option>
                      <option>Portrait</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Width</span>
                    <input name="width" value={formData.width} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Height</span>
                    <input name="height" value={formData.height} onChange={handleChange} className={fieldStyle} />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Printing & Binding</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Printing Type</span>
                    <input name="printingType" value={formData.printingType} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Print Quality</span>
                    <input name="printQuality" value={formData.printQuality} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Printing Sides</span>
                    <input name="printingSides" value={formData.printingSides} onChange={handleChange} className={fieldStyle} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#2d2d2d]">Binding Type</span>
                    <input name="bindingType" value={formData.bindingType} onChange={handleChange} className={fieldStyle} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5 xl:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Description</h2>
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-[#2d2d2d]">Short Description</span>
                <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} className={fieldStyle} />
              </label>
              <label className="mt-4 block space-y-2">
                <span className="text-sm font-medium text-[#2d2d2d]">Description</span>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={`${fieldStyle} resize-none`} />
              </label>
            </div>

            <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
              <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Pricing</h2>
              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Cost Price</span>
                  <input name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Selling Price</span>
                  <input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Discount Price</span>
                  <input name="discountPrice" type="number" value={formData.discountPrice} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Discount Percentage</span>
                  <input name="discountPercentage" type="number" value={formData.discountPercentage} onChange={handleChange} className={fieldStyle} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
              <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Stock Information</h2>
              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Stock Quantity</span>
                  <input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Minimum Stock</span>
                  <input name="minimumStock" type="number" value={formData.minimumStock} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Stock Status</span>
                  <select name="stockStatus" value={formData.stockStatus} onChange={handleChange} className={fieldStyle}>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
              <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Customization Options</h2>
              <div className="space-y-3">
                {[
                  ['customizationAvailable', 'Customization Available'],
                  ['customerNamePrinting', 'Customer Name Printing'],
                  ['photoUploadRequired', 'Photo Upload Required'],
                  ['customCoverDesign', 'Custom Cover Design'],
                  ['featuredProduct', 'Featured Product'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-lg border border-[#dfe2e5] bg-white px-3 py-2.5">
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key]}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-[#dfe2e5] text-[#1a3c36] focus:ring-[#1a3c36]"
                    />
                    <span className="text-sm font-medium text-[#2d2d2d]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e7e0d8] bg-[#faf9f8] p-5">
              <h2 className="mb-4 text-lg font-semibold text-[#1f1d1b]">Delivery & SEO</h2>
              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Estimated Delivery Days</span>
                  <input name="estimatedDeliveryDays" type="number" value={formData.estimatedDeliveryDays} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Status</span>
                  <select name="status" value={formData.status} onChange={handleChange} className={fieldStyle}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Meta Title</span>
                  <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} className={fieldStyle} />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-[#2d2d2d]">Meta Description</span>
                  <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={3} className={`${fieldStyle} resize-none`} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#ece9e5] pt-5">
            <button type="button" onClick={() => navigate('/admin/albums')} className="rounded-xl border border-[#dfe2e5] bg-white px-5 py-2.5 text-sm font-medium text-[#2d2d2d]">
              Cancel
            </button>
            {mode !== 'view' && (
              <button type="submit" disabled={saving} className="rounded-xl bg-[#1a3c36] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(26,60,54,0.18)] disabled:opacity-70">
                {saving ? 'Saving...' : mode === 'edit' ? 'Update Album' : 'Save Album'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlbum;

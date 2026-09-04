const { getDB } = require("../config/db");

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [value];
  }
};

const getNextAlbumId = async () => {
  const query = `
    SELECT product_id
    FROM albums
    WHERE product_id REGEXP '^ALB[0-9]+$'
    ORDER BY CAST(SUBSTRING(product_id, 4) AS UNSIGNED) DESC
    LIMIT 1
  `;

  const pool = getDB();
  const [rows] = await pool.query(query);
  const lastId = rows?.[0]?.product_id || "ALB000";
  let lastNumber = Number(String(lastId).replace(/\D/g, "")) || 0;

  let nextNumber = lastNumber + 1;
  let candidate = `ALB${String(nextNumber).padStart(3, "0")}`;

  while (true) {
    const [duplicateCheck] = await pool.query(
      "SELECT 1 FROM albums WHERE product_id = ? LIMIT 1",
      [candidate]
    );

    if (!duplicateCheck.length) {
      return candidate;
    }

    nextNumber += 1;
    candidate = `ALB${String(nextNumber).padStart(3, "0")}`;
  }
};

const resolveUniqueAlbumId = async (requestedId) => {
  if (!requestedId || !String(requestedId).trim()) {
    return getNextAlbumId();
  }

  const pool = getDB();
  const [rows] = await pool.query("SELECT 1 FROM albums WHERE product_id = ? LIMIT 1", [requestedId]);

  if (!rows.length) {
    return requestedId;
  }

  return getNextAlbumId();
};

const mapRow = (row) => ({
  ...row,
  product_images: parseJsonArray(row.product_images),
  keywords: parseJsonArray(row.keywords),
  customization_available: Boolean(row.customization_available),
  customer_name_printing: Boolean(row.customer_name_printing),
  photo_upload_required: Boolean(row.photo_upload_required),
  custom_cover_design: Boolean(row.custom_cover_design),
  featured_product: Boolean(row.featured_product),
  cost_price: Number(row.cost_price || 0),
  selling_price: Number(row.selling_price || 0),
  discount_price: Number(row.discount_price || 0),
  discount_percentage: Number(row.discount_percentage || 0),
  stock_quantity: Number(row.stock_quantity || 0),
  minimum_stock: Number(row.minimum_stock || 0),
  estimated_delivery_days: Number(row.estimated_delivery_days || 0),
});

const createAlbum = async (albumData) => {
  const {
    product_id,
    product_name,
    product_code,
    category,
    sub_category,
    brand,
    album_type,
    occasion,
    theme,
    size,
    width,
    height,
    orientation,
    total_pages,
    sheet_count,
    page_material,
    page_thickness,
    cover_type,
    cover_material,
    cover_finish,
    cover_color,
    printing_type,
    print_quality,
    printing_sides,
    binding_type,
    thumbnail_image,
    product_images,
    cost_price,
    selling_price,
    discount_price,
    discount_percentage,
    stock_quantity,
    minimum_stock,
    stock_status,
    short_description,
    description,
    customization_available,
    customer_name_printing,
    photo_upload_required,
    custom_cover_design,
    estimated_delivery_days,
    status,
    featured_product,
    meta_title,
    meta_description,
    keywords,
    created_by,
    updated_by,
    created_at,
    updated_at,
  } = albumData;

  const resolvedProductId = await resolveUniqueAlbumId(product_id);

  const columns = [
    "product_id",
    "product_name",
    "product_code",
    "category",
    "sub_category",
    "brand",
    "album_type",
    "occasion",
    "theme",
    "size",
    "width",
    "height",
    "orientation",
    "total_pages",
    "sheet_count",
    "page_material",
    "page_thickness",
    "cover_type",
    "cover_material",
    "cover_finish",
    "cover_color",
    "printing_type",
    "print_quality",
    "printing_sides",
    "binding_type",
    "thumbnail_image",
    "product_images",
    "cost_price",
    "selling_price",
    "discount_price",
    "discount_percentage",
    "stock_quantity",
    "minimum_stock",
    "stock_status",
    "short_description",
    "description",
    "customization_available",
    "customer_name_printing",
    "photo_upload_required",
    "custom_cover_design",
    "estimated_delivery_days",
    "status",
    "featured_product",
    "meta_title",
    "meta_description",
    "keywords",
    "created_by",
    "updated_by",
    "created_at",
    "updated_at",
  ];

  const placeholders = columns.map(() => "?").join(", ");
  const query = `
    INSERT INTO albums (
      ${columns.join(", ")}
    ) VALUES (${placeholders})
  `;

  const values = [
    resolvedProductId,
    product_name,
    product_code,
    category,
    sub_category,
    brand,
    album_type,
    occasion,
    theme,
    size,
    width,
    height,
    orientation,
    Number(total_pages || 0),
    Number(sheet_count || 0),
    page_material,
    page_thickness,
    cover_type,
    cover_material,
    cover_finish,
    cover_color,
    printing_type,
    print_quality,
    printing_sides,
    binding_type,
    thumbnail_image || "",
    JSON.stringify(Array.isArray(product_images) ? product_images : []),
    Number(cost_price || 0),
    Number(selling_price || 0),
    Number(discount_price || 0),
    Number(discount_percentage || 0),
    Number(stock_quantity || 0),
    Number(minimum_stock || 0),
    stock_status || "In Stock",
    short_description || "",
    description || "",
    customization_available ? 1 : 0,
    customer_name_printing ? 1 : 0,
    photo_upload_required ? 1 : 0,
    custom_cover_design ? 1 : 0,
    Number(estimated_delivery_days || 0),
    status || "Active",
    featured_product ? 1 : 0,
    meta_title || "",
    meta_description || "",
    JSON.stringify(Array.isArray(keywords) ? keywords : []),
    created_by || "Admin",
    updated_by || created_by || "Admin",
    created_at || new Date().toISOString(),
    updated_at || created_at || new Date().toISOString(),
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values).catch(async (error) => {
    if (error.code === "ER_DUP_ENTRY" && /product_id/i.test(error.message)) {
      const fallbackProductId = await getNextAlbumId();
      const fallbackValues = [...values];
      fallbackValues[0] = fallbackProductId;
      const [fallbackResult] = await pool.query(query, fallbackValues);
      return [fallbackResult];
    }
    throw error;
  });

  return {
    id: result.insertId,
    product_id: resolvedProductId,
    product_name,
    product_code,
    category,
    sub_category,
    brand,
    status: status || "Active",
  };
};

const getAllAlbums = async () => {
  const query = `SELECT * FROM albums ORDER BY created_at DESC`;

  const pool = getDB();
  const [rows] = await pool.query(query);
  return rows.map(mapRow);
};

const getAlbumById = async (productId) => {
  const query = `SELECT * FROM albums WHERE product_id = ? LIMIT 1`;
  const pool = getDB();
  const [rows] = await pool.query(query, [productId]);

  if (!rows.length) return null;
  return mapRow(rows[0]);
};

const updateAlbum = async (albumId, updateData) => {
  const {
    product_name,
    product_code,
    category,
    sub_category,
    brand,
    album_type,
    occasion,
    theme,
    size,
    width,
    height,
    orientation,
    total_pages,
    sheet_count,
    page_material,
    page_thickness,
    cover_type,
    cover_material,
    cover_finish,
    cover_color,
    printing_type,
    print_quality,
    printing_sides,
    binding_type,
    thumbnail_image,
    product_images,
    cost_price,
    selling_price,
    discount_price,
    discount_percentage,
    stock_quantity,
    minimum_stock,
    stock_status,
    short_description,
    description,
    customization_available,
    customer_name_printing,
    photo_upload_required,
    custom_cover_design,
    estimated_delivery_days,
    status,
    featured_product,
    meta_title,
    meta_description,
    keywords,
    updated_by,
    updated_at,
  } = updateData;

  const query = `
    UPDATE albums
    SET product_name = ?,
        product_code = ?,
        category = ?,
        sub_category = ?,
        brand = ?,
        album_type = ?,
        occasion = ?,
        theme = ?,
        size = ?,
        width = ?,
        height = ?,
        orientation = ?,
        total_pages = ?,
        sheet_count = ?,
        page_material = ?,
        page_thickness = ?,
        cover_type = ?,
        cover_material = ?,
        cover_finish = ?,
        cover_color = ?,
        printing_type = ?,
        print_quality = ?,
        printing_sides = ?,
        binding_type = ?,
        thumbnail_image = ?,
        product_images = ?,
        cost_price = ?,
        selling_price = ?,
        discount_price = ?,
        discount_percentage = ?,
        stock_quantity = ?,
        minimum_stock = ?,
        stock_status = ?,
        short_description = ?,
        description = ?,
        customization_available = ?,
        customer_name_printing = ?,
        photo_upload_required = ?,
        custom_cover_design = ?,
        estimated_delivery_days = ?,
        status = ?,
        featured_product = ?,
        meta_title = ?,
        meta_description = ?,
        keywords = ?,
        updated_by = ?,
        updated_at = ?
    WHERE product_id = ?
  `;

  const values = [
    product_name,
    product_code,
    category,
    sub_category,
    brand,
    album_type,
    occasion,
    theme,
    size,
    width,
    height,
    orientation,
    Number(total_pages || 0),
    Number(sheet_count || 0),
    page_material,
    page_thickness,
    cover_type,
    cover_material,
    cover_finish,
    cover_color,
    printing_type,
    print_quality,
    printing_sides,
    binding_type,
    thumbnail_image || "",
    JSON.stringify(Array.isArray(product_images) ? product_images : []),
    Number(cost_price || 0),
    Number(selling_price || 0),
    Number(discount_price || 0),
    Number(discount_percentage || 0),
    Number(stock_quantity || 0),
    Number(minimum_stock || 0),
    stock_status || "In Stock",
    short_description || "",
    description || "",
    customization_available ? 1 : 0,
    customer_name_printing ? 1 : 0,
    photo_upload_required ? 1 : 0,
    custom_cover_design ? 1 : 0,
    Number(estimated_delivery_days || 0),
    status || "Active",
    featured_product ? 1 : 0,
    meta_title || "",
    meta_description || "",
    JSON.stringify(Array.isArray(keywords) ? keywords : []),
    updated_by || "Admin",
    updated_at || new Date().toISOString(),
    albumId,
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    affectedRows: result.affectedRows,
    product_id: albumId,
  };
};

const deleteAlbum = async (productId) => {
  const query = `DELETE FROM albums WHERE product_id = ?`;
  const pool = getDB();
  const [result] = await pool.query(query, [productId]);

  return {
    affectedRows: result.affectedRows,
    product_id: productId,
  };
};

module.exports = {
  getNextAlbumId,
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
};

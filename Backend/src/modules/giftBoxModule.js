const { getDB } = require("../config/db");

const parseJson = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapRow = (row) => ({
  ...row,
  images: parseJson(row.images, []),
  customization: parseJson(row.customization, {}),
  gift_items: parseJson(row.gift_items, []),
  mrp: Number(row.mrp || 0),
  discount_percentage: Number(row.discount_percentage || 0),
  selling_price: Number(row.selling_price || 0),
  current_stock: Number(row.current_stock || 0),
  orders: Number(row.orders || 0),
  sales_today: Number(row.sales_today || 0),
});

const calculateStockStatus = (stock) => {
  const num = Number(stock || 0);
  if (num <= 0) return "Out of Stock";
  if (num <= 5) return "Low Stock";
  return "Available";
};

const getAllGiftBoxes = async () => {
  const pool = getDB();
  const [rows] = await pool.query("SELECT * FROM gift_boxes ORDER BY created_at DESC");
  return rows.map(mapRow);
};

const getGiftBoxById = async (id) => {
  const pool = getDB();
  const isNumeric = /^\d+$/.test(String(id).trim());
  const query = isNumeric
    ? "SELECT * FROM gift_boxes WHERE id = ? OR gift_box_id = ? LIMIT 1"
    : "SELECT * FROM gift_boxes WHERE gift_box_id = ? LIMIT 1";
  const params = isNumeric ? [Number(id), String(id)] : [String(id)];
  const [rows] = await pool.query(query, params);
  return rows.length ? mapRow(rows[0]) : null;
};

const createGiftBox = async (giftBox) => {
  const pool = getDB();
  const stock = Number(giftBox.current_stock || 0);
  const stockStatus = giftBox.stock_status || calculateStockStatus(stock);

  const [result] = await pool.query(
    `INSERT INTO gift_boxes (
      gift_box_id, name, category, sub_category, description, brand, material, box_size,
      color, theme, box_type, mrp, discount_percentage, selling_price, current_stock,
      stock_status, image, images, customization, gift_items, orders, sales_today, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      giftBox.gift_box_id, giftBox.name, giftBox.category, giftBox.sub_category || "",
      giftBox.description || "", giftBox.brand || "Q Frames Prima Shop", giftBox.material || "",
      giftBox.box_size || "", giftBox.color || "", giftBox.theme || "", giftBox.box_type || "",
      giftBox.mrp, giftBox.discount_percentage, giftBox.selling_price, stock,
      stockStatus, giftBox.image || "", JSON.stringify(giftBox.images || []),
      JSON.stringify(giftBox.customization || {}), JSON.stringify(giftBox.gift_items || []),
      giftBox.orders || 0, giftBox.sales_today || 0, giftBox.created_by || null, giftBox.updated_by || null,
    ],
  );
  return getGiftBoxById(result.insertId);
};

const updateGiftBox = async (id, giftBox) => {
  const existing = await getGiftBoxById(id);
  if (!existing) return null;

  const pool = getDB();
  const stock = Number(giftBox.current_stock !== undefined ? giftBox.current_stock : existing.current_stock);
  const stockStatus = giftBox.stock_status || calculateStockStatus(stock);

  await pool.query(
    `UPDATE gift_boxes SET name = ?, category = ?, sub_category = ?, description = ?, brand = ?,
      material = ?, box_size = ?, color = ?, theme = ?, box_type = ?, mrp = ?,
      discount_percentage = ?, selling_price = ?, current_stock = ?, stock_status = ?,
      image = ?, images = ?, customization = ?, gift_items = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?`,
    [
      giftBox.name, giftBox.category, giftBox.sub_category || "", giftBox.description || "",
      giftBox.brand || "Q Frames Prima Shop", giftBox.material || "", giftBox.box_size || "",
      giftBox.color || "", giftBox.theme || "", giftBox.box_type || "", giftBox.mrp,
      giftBox.discount_percentage, giftBox.selling_price, stock, stockStatus,
      giftBox.image || "", JSON.stringify(giftBox.images || []), JSON.stringify(giftBox.customization || {}),
      JSON.stringify(giftBox.gift_items || []), giftBox.updated_by || null, existing.id,
    ],
  );
  return getGiftBoxById(existing.id);
};

const adjustGiftBoxStock = async (id, { action = "reduce", amount = 1, stock = null }) => {
  const existing = await getGiftBoxById(id);
  if (!existing) return null;

  let newStock;
  if (stock !== null && stock !== undefined && !Number.isNaN(Number(stock))) {
    newStock = Math.max(0, Math.floor(Number(stock)));
  } else if (action === "reduce") {
    const dec = Math.max(1, Math.floor(Number(amount) || 1));
    newStock = Math.max(0, Number(existing.current_stock || 0) - dec);
  } else if (action === "increase") {
    const inc = Math.max(1, Math.floor(Number(amount) || 1));
    newStock = Math.max(0, Number(existing.current_stock || 0) + inc);
  } else {
    newStock = Math.max(0, Math.floor(Number(existing.current_stock || 0)));
  }

  const stockStatus = calculateStockStatus(newStock);
  const pool = getDB();
  await pool.query(
    `UPDATE gift_boxes SET current_stock = ?, stock_status = ?, updated_at = NOW() WHERE id = ?`,
    [newStock, stockStatus, existing.id],
  );

  return getGiftBoxById(existing.id);
};

const deleteGiftBox = async (id) => {
  const existing = await getGiftBoxById(id);
  if (!existing) return { affectedRows: 0, id };

  const pool = getDB();
  const [result] = await pool.query("DELETE FROM gift_boxes WHERE id = ?", [existing.id]);
  return { affectedRows: result.affectedRows, id };
};

module.exports = {
  getAllGiftBoxes,
  getGiftBoxById,
  createGiftBox,
  updateGiftBox,
  adjustGiftBoxStock,
  calculateStockStatus,
  deleteGiftBox,
};

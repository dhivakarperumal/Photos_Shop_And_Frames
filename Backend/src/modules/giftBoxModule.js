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

const getAllGiftBoxes = async () => {
  const pool = getDB();
  const [rows] = await pool.query("SELECT * FROM gift_boxes ORDER BY created_at DESC");
  return rows.map(mapRow);
};

const getGiftBoxById = async (id) => {
  const pool = getDB();
  const [rows] = await pool.query("SELECT * FROM gift_boxes WHERE gift_box_id = ? OR id = ? LIMIT 1", [id, id]);
  return rows.length ? mapRow(rows[0]) : null;
};

const createGiftBox = async (giftBox) => {
  const pool = getDB();
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
      giftBox.mrp, giftBox.discount_percentage, giftBox.selling_price, giftBox.current_stock,
      giftBox.stock_status, giftBox.image || "", JSON.stringify(giftBox.images || []),
      JSON.stringify(giftBox.customization || {}), JSON.stringify(giftBox.gift_items || []),
      giftBox.orders || 0, giftBox.sales_today || 0, giftBox.created_by || null, giftBox.updated_by || null,
    ],
  );
  return getGiftBoxById(result.insertId);
};

const updateGiftBox = async (id, giftBox) => {
  const pool = getDB();
  const [result] = await pool.query(
    `UPDATE gift_boxes SET name = ?, category = ?, sub_category = ?, description = ?, brand = ?,
      material = ?, box_size = ?, color = ?, theme = ?, box_type = ?, mrp = ?,
      discount_percentage = ?, selling_price = ?, current_stock = ?, stock_status = ?,
      image = ?, images = ?, customization = ?, gift_items = ?, updated_by = ?
      WHERE gift_box_id = ? OR id = ?`,
    [
      giftBox.name, giftBox.category, giftBox.sub_category || "", giftBox.description || "",
      giftBox.brand || "Q Frames Prima Shop", giftBox.material || "", giftBox.box_size || "",
      giftBox.color || "", giftBox.theme || "", giftBox.box_type || "", giftBox.mrp,
      giftBox.discount_percentage, giftBox.selling_price, giftBox.current_stock, giftBox.stock_status,
      giftBox.image || "", JSON.stringify(giftBox.images || []), JSON.stringify(giftBox.customization || {}),
      JSON.stringify(giftBox.gift_items || []), giftBox.updated_by || null, id, id,
    ],
  );
  return result.affectedRows ? getGiftBoxById(id) : null;
};

const deleteGiftBox = async (id) => {
  const pool = getDB();
  const [result] = await pool.query("DELETE FROM gift_boxes WHERE gift_box_id = ? OR id = ?", [id, id]);
  return { affectedRows: result.affectedRows, id };
};

module.exports = { getAllGiftBoxes, getGiftBoxById, createGiftBox, updateGiftBox, deleteGiftBox };

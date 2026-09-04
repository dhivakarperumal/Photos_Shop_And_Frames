const giftBoxModule = require("../modules/giftBoxModule");

const normalizeGiftBox = (body, user) => {
  const mrp = Number(body.mrp || 0);
  const discount = Number(body.discount_percentage ?? body.discount ?? 0);
  const currentStock = Number(body.current_stock ?? body.currentStock ?? 0);
  const sellingPrice = Math.max(0, Math.round(mrp * (1 - discount / 100)));

  return {
    gift_box_id: body.gift_box_id || body.id,
    name: String(body.name || "").trim(),
    category: String(body.category || "").trim(),
    sub_category: body.sub_category ?? body.subCategory ?? "",
    description: body.description || "",
    brand: body.brand || "Q Frames Prima Shop",
    material: body.material || "",
    box_size: body.box_size ?? body.size ?? "",
    color: body.color || "",
    theme: body.theme || "",
    box_type: body.box_type ?? body.boxType ?? "",
    mrp,
    discount_percentage: discount,
    selling_price: sellingPrice,
    current_stock: currentStock,
    stock_status: currentStock <= 0 ? "Out of Stock" : "Available",
    image: body.image || body.images?.[0] || "",
    images: Array.isArray(body.images) ? body.images : body.image ? [body.image] : [],
    customization: body.customization || {
      customerName: Boolean(body.customerName),
      photoUpload: Boolean(body.photoUpload),
      customMessage: Boolean(body.customMessage),
      greetingCard: Boolean(body.greetingCard),
    },
    gift_items: Array.isArray(body.gift_items) ? body.gift_items : Array.isArray(body.items) ? body.items : [],
    created_by: user?.userId || user?.id || null,
    updated_by: user?.userId || user?.id || null,
  };
};

const getAllGiftBoxes = async (req, res) => {
  try {
    const giftBoxes = await giftBoxModule.getAllGiftBoxes();
    res.status(200).json({ success: true, count: giftBoxes.length, data: giftBoxes });
  } catch (error) {
    console.error("Get gift boxes error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve gift boxes" });
  }
};

const getGiftBoxById = async (req, res) => {
  try {
    const giftBox = await giftBoxModule.getGiftBoxById(req.params.id);
    if (!giftBox) return res.status(404).json({ success: false, message: "Gift box not found" });
    res.status(200).json({ success: true, data: giftBox });
  } catch (error) {
    console.error("Get gift box error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve gift box" });
  }
};

const createGiftBox = async (req, res) => {
  try {
    const giftBox = normalizeGiftBox(req.body, req.user);
    if (!giftBox.name || !giftBox.category) return res.status(400).json({ success: false, message: "Gift box name and category are required" });
    if (!giftBox.gift_box_id) return res.status(400).json({ success: false, message: "Gift box code is required" });
    const result = await giftBoxModule.createGiftBox(giftBox);
    res.status(201).json({ success: true, message: "Gift box created successfully", data: result });
  } catch (error) {
    console.error("Create gift box error:", error);
    res.status(500).json({ success: false, message: error.code === "ER_DUP_ENTRY" ? "Gift box code already exists" : error.message || "Failed to create gift box" });
  }
};

const updateGiftBox = async (req, res) => {
  try {
    const giftBox = normalizeGiftBox({ ...req.body, gift_box_id: req.params.id }, req.user);
    const result = await giftBoxModule.updateGiftBox(req.params.id, giftBox);
    if (!result) return res.status(404).json({ success: false, message: "Gift box not found" });
    res.status(200).json({ success: true, message: "Gift box updated successfully", data: result });
  } catch (error) {
    console.error("Update gift box error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update gift box" });
  }
};

const deleteGiftBox = async (req, res) => {
  try {
    const result = await giftBoxModule.deleteGiftBox(req.params.id);
    res.status(200).json({ success: true, message: "Gift box deleted successfully", data: result });
  } catch (error) {
    console.error("Delete gift box error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete gift box" });
  }
};

module.exports = { getAllGiftBoxes, getGiftBoxById, createGiftBox, updateGiftBox, deleteGiftBox };

const { getDB } = require("../config/db");
const { randomUUID } = require("crypto");

/**
 * Generates a clean human-readable Order ID
 * Format: ORD-YYYYMMDD-XXXX (e.g. ORD-20260903-D38W)
 */
const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}${day}-${randomChars}`;
};

const parseSizeVariants = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeComparableText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\binches?\b/g, "inch")
    .replace(/\bcm\b/g, "cm")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const findMatchingVariantIndex = (variants, size, color = null) => {
  if (!Array.isArray(variants)) return -1;

  const normalizedSize = normalizeComparableText(size);
  const normalizedColor = normalizeComparableText(color);

  return variants.findIndex((variant) => {
    const variantSize = normalizeComparableText(variant?.size || variant?.size_name || variant?.label || variant?.name || "");
    const variantColor = normalizeComparableText(variant?.color || variant?.colour || variant?.variant_color || "");

    const sizeMatches = !normalizedSize || !variantSize || variantSize === normalizedSize;
    const colorMatches = !normalizedColor || !variantColor || variantColor === normalizedColor;
    return sizeMatches && colorMatches;
  });
};

const resolveOrderItemInventory = async (connection, item) => {
  const rawId = item.product_id ?? item.id ?? item.productId ?? null;
  const normalizedId = rawId === null || rawId === undefined ? null : String(rawId).trim();
  const selectedSize = String(item.size || item.variant_size || item.selected_size || "Standard").trim();
  const quantity = Number(item.quantity || 1);

  if (!normalizedId || normalizedId === "null" || normalizedId === "undefined") {
    throw new Error("Missing product id for order item");
  }

  const [productRows] = await connection.query(
    `SELECT id, product_name, category, size_variants
     FROM products WHERE id = ? OR CAST(id AS CHAR) = ? LIMIT 1`,
    [Number(rawId) || 0, normalizedId],
  );

  if (productRows.length) {
    const product = productRows[0];
    const variants = parseSizeVariants(product.size_variants);
    const variantIndex = findMatchingVariantIndex(variants, selectedSize);

    if (variantIndex < 0) {
      throw new Error(`Selected size "${selectedSize}" is not available for product ${rawId}`);
    }

    const availableStock = Number(variants[variantIndex].stock ?? 0);
    if (availableStock < quantity) {
      throw new Error(`Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for size "${selectedSize}"`);
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], stock: availableStock - quantity };

    return {
      kind: "product",
      record: product,
      variants: updatedVariants,
      selectedSize,
      quantity,
      productName: item.product_name || product.product_name || "Product",
      category: item.category || product.category || "Photo Frames",
      productId: rawId,
    };
  }

  const [albumRows] = await connection.query(
    `SELECT id, product_id, product_name, category, stock_quantity, size, size_options, variants
     FROM albums
     WHERE id = ? OR CAST(id AS CHAR) = ? OR product_id = ? OR LOWER(product_id) = ?
     LIMIT 1`,
    [
      Number(rawId) || 0,
      normalizedId,
      normalizedId,
      normalizedId.toLowerCase(),
    ],
  );

  if (albumRows.length) {
    const album = albumRows[0];
    const albumVariants = parseSizeVariants(album.variants);
    const sizeOptions = parseSizeVariants(album.size_options);
    const albumSize = String(album.size || "").trim();
    const variantSizes = sizeOptions.length ? sizeOptions.map((entry) => String(entry.size || entry || "")) : [];
    const resolvedSize = selectedSize || albumSize || (variantSizes[0] || "Standard");
    const resolvedColor = String(item.color || item.variant_color || item.selected_color || "").trim();
    const variantIndex = findMatchingVariantIndex(albumVariants, resolvedSize, resolvedColor);
    const availableStock = variantIndex >= 0
      ? Number(albumVariants[variantIndex].stock ?? albumVariants[variantIndex].quantity ?? 0)
      : Number(album.stock_quantity || 0);

    if (availableStock < quantity) {
      throw new Error(`Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for album "${album.product_name || album.product_id}"`);
    }

    if (variantIndex >= 0) {
      const updatedVariants = [...albumVariants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        stock: Number(updatedVariants[variantIndex].stock ?? 0) - quantity,
      };

      return {
        kind: "album",
        record: album,
        variants: updatedVariants,
        selectedSize: resolvedSize,
        selectedColor: resolvedColor,
        quantity,
        productName: item.product_name || album.product_name || "Album",
        category: item.category || album.category || "Albums",
        productId: rawId,
      };
    }

    return {
      kind: "album",
      record: album,
      variants: albumVariants,
      selectedSize: resolvedSize,
      selectedColor: resolvedColor,
      quantity,
      productName: item.product_name || album.product_name || "Album",
      category: item.category || album.category || "Albums",
      productId: rawId,
    };
  }

  const lookupCandidates = Array.from(
    new Set(
      [
        rawId,
        normalizedId,
        Number(rawId) || null,
        String(rawId || "").replace(/^gift[-_\s]*/i, ""),
        String(rawId || "").replace(/^giftbox[-_\s]*/i, ""),
        String(rawId || "").replace(/^gift[-_\s]*/i, ""),
      ].filter((value) => value !== null && value !== undefined && value !== "" && value !== "null" && value !== "undefined")
    )
  );

  const [giftRows] = await connection.query(
    `SELECT id, gift_box_id, name, category, current_stock, box_size, stock_status
     FROM gift_boxes
     WHERE id = ? OR CAST(id AS CHAR) = ? OR gift_box_id = ? OR LOWER(gift_box_id) = ? OR CONCAT('gift-', id) = ? OR CONCAT('gift-', gift_box_id) = ?
     LIMIT 1`,
    [
      Number(rawId) || 0,
      normalizedId,
      normalizedId,
      normalizedId.toLowerCase(),
      normalizedId,
      normalizedId,
    ].concat(lookupCandidates.slice(0, 3).map((value) => String(value))),
  );

  if (giftRows.length) {
    const gift = giftRows[0];
    const availableStock = Number(gift.current_stock || 0);

    if (availableStock < quantity) {
      throw new Error(`Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for gift "${gift.name || gift.gift_box_id}"`);
    }

    return {
      kind: "gift",
      record: gift,
      selectedSize: String(item.size || gift.box_size || "Standard").trim(),
      quantity,
      productName: item.product_name || gift.name || "Gift Box",
      category: item.category || gift.category || "Gift Box",
      productId: rawId,
    };
  }

  throw new Error(`Product ${rawId} was not found`);
};

const normalizeComparableText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\binches?\b/g, "inch")
    .replace(/\bcm\b/g, "cm")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const findMatchingVariantIndex = (variants, size, color = null) => {
  if (!Array.isArray(variants)) return -1;

  const normalizedSize = normalizeComparableText(size);
  const normalizedColor = normalizeComparableText(color);

  return variants.findIndex((variant) => {
    const variantSize = normalizeComparableText(variant?.size || variant?.size_name || variant?.label || variant?.name || "");
    const variantColor = normalizeComparableText(variant?.color || variant?.colour || variant?.variant_color || "");

    const sizeMatches = !normalizedSize || !variantSize || variantSize === normalizedSize;
    const colorMatches = !normalizedColor || !variantColor || variantColor === normalizedColor;
    return sizeMatches && colorMatches;
  });
};

const resolveOrderItemInventory = async (connection, item) => {
  const rawId = item.product_id ?? item.id ?? item.productId ?? null;
  const normalizedId = rawId === null || rawId === undefined ? null : String(rawId).trim();
  const selectedSize = String(item.size || item.variant_size || item.selected_size || "Standard").trim();
  const quantity = Number(item.quantity || 1);

  if (!normalizedId || normalizedId === "null" || normalizedId === "undefined") {
    throw new Error("Missing product id for order item");
  }

  const [productRows] = await connection.query(
    `SELECT id, product_name, category, size_variants
     FROM products WHERE id = ? OR CAST(id AS CHAR) = ? LIMIT 1`,
    [Number(rawId) || 0, normalizedId],
  );

  if (productRows.length) {
    const product = productRows[0];
    const variants = parseSizeVariants(product.size_variants);
    const variantIndex = findMatchingVariantIndex(variants, selectedSize);

    if (variantIndex < 0) {
      throw new Error(`Selected size "${selectedSize}" is not available for product ${rawId}`);
    }

    const availableStock = Number(variants[variantIndex].stock ?? 0);
    if (availableStock < quantity) {
      throw new Error(`Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for size "${selectedSize}"`);
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], stock: availableStock - quantity };

    return {
      kind: "product",
      record: product,
      variants: updatedVariants,
      selectedSize,
      quantity,
      productName: item.product_name || product.product_name || "Product",
      category: item.category || product.category || "Photo Frames",
      productId: rawId,
    };
  }

  const [albumRows] = await connection.query(
    `SELECT id, product_id, product_name, category, stock_quantity, size, size_options, variants
     FROM albums
     WHERE id = ? OR CAST(id AS CHAR) = ? OR product_id = ? OR LOWER(product_id) = ?
     LIMIT 1`,
    [
      Number(rawId) || 0,
      normalizedId,
      normalizedId,
      normalizedId.toLowerCase(),
    ],
  );

  if (albumRows.length) {
    const album = albumRows[0];
    const albumVariants = parseSizeVariants(album.variants);
    const sizeOptions = parseSizeVariants(album.size_options);
    const albumSize = String(album.size || "").trim();
    const variantSizes = sizeOptions.length ? sizeOptions.map((entry) => String(entry.size || entry || "")) : [];
    const resolvedSize = selectedSize || albumSize || (variantSizes[0] || "Standard");
    const resolvedColor = String(item.color || item.variant_color || item.selected_color || "").trim();
    const variantIndex = findMatchingVariantIndex(albumVariants, resolvedSize, resolvedColor);
    const availableStock = variantIndex >= 0
      ? Number(albumVariants[variantIndex].stock ?? albumVariants[variantIndex].quantity ?? 0)
      : Number(album.stock_quantity || 0);

    if (availableStock < quantity) {
      throw new Error(`Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for album "${album.product_name || album.product_id}"`);
    }

    if (variantIndex >= 0) {
      const updatedVariants = [...albumVariants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        stock: Number(updatedVariants[variantIndex].stock ?? 0) - quantity,
      };

      return {
        kind: "album",
        record: album,
        variants: updatedVariants,
        selectedSize: resolvedSize,
        selectedColor: resolvedColor,
        quantity,
        productName: item.product_name || album.product_name || "Album",
        category: item.category || album.category || "Albums",
        productId: rawId,
      };
    }

    return {
      kind: "album",
      record: album,
      variants: albumVariants,
      selectedSize: resolvedSize,
      selectedColor: resolvedColor,
      quantity,
      productName: item.product_name || album.product_name || "Album",
      category: item.category || album.category || "Albums",
      productId: rawId,
    };
  }

  const lookupCandidates = Array.from(
    new Set(
      [
        rawId,
        normalizedId,
        Number(rawId) || null,
        String(rawId || "").replace(/^gift[-_\s]*/i, ""),
        String(rawId || "").replace(/^giftbox[-_\s]*/i, ""),
        String(rawId || "").replace(/^gift[-_\s]*/i, ""),
      ].filter((value) => value !== null && value !== undefined && value !== "" && value !== "null" && value !== "undefined")
    )
  );

  const [giftRows] = await connection.query(
    `SELECT id, gift_box_id, name, category, current_stock, box_size, stock_status
     FROM gift_boxes
     WHERE id = ? OR CAST(id AS CHAR) = ? OR gift_box_id = ? OR LOWER(gift_box_id) = ? OR CONCAT('gift-', id) = ? OR CONCAT('gift-', gift_box_id) = ?
     LIMIT 1`,
    [
      Number(rawId) || 0,
      normalizedId,
      normalizedId,
      normalizedId.toLowerCase(),
      normalizedId,
      normalizedId,
    ].concat(lookupCandidates.slice(0, 3).map((value) => String(value))),
  );

  if (giftRows.length) {
    const gift = giftRows[0];
    const availableStock = Number(gift.current_stock || 0);

    if (availableStock < quantity) {
      throw new Error(`Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for gift "${gift.name || gift.gift_box_id}"`);
    }

    return {
      kind: "gift",
      record: gift,
      selectedSize: String(item.size || gift.box_size || "Standard").trim(),
      quantity,
      productName: item.product_name || gift.name || "Gift Box",
      category: item.category || gift.category || "Gift Box",
      productId: rawId,
    };
  }

  throw new Error(`Product ${rawId} was not found`);
};

const createOrder = async (arg1, arg2 = [], arg3 = null) => {
  const isWrapped = arg1 && typeof arg1 === "object" && "orderData" in arg1;
  const orderData = isWrapped ? arg1.orderData : (arg1 || {});
  const items = isWrapped ? (arg1.items || []) : (Array.isArray(arg2) ? arg2 : (arg1?.items || []));
  const address = isWrapped ? (arg1.address || null) : (arg3 || arg1?.address || null);

  const pool = getDB();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = orderData.order_id || generateOrderId();

    const insertOrderQuery = `
      INSERT INTO orders (
        order_id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        billing_type,
        order_date,
        city,
        state,
        pincode,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        notes,
        created_by,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderValues = [
      orderId,
      orderData.user_id || null,
      orderData.customer_name,
      orderData.customer_email || "",
      orderData.customer_phone,
      orderData.shipping_address,
      orderData.billing_type || "Online Order",
      orderData.order_date || null,
      orderData.city || "",
      orderData.state || "",
      orderData.pincode || "",
      Number(orderData.total_amount || 0),
      orderData.payment_method || "Cash On Delivery",
      orderData.payment_status || "Pending",
      orderData.order_status || "Pending",
      orderData.notes || "",
      orderData.created_by || orderData.user_id || null,
      orderData.updated_by || orderData.user_id || null,
    ];

    const [orderResult] = await connection.query(insertOrderQuery, orderValues);

    // Insert order items
    const insertItemQuery = `
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        category,
        size,
        price,
        quantity,
        total_price,
        customization_id,
        slot_photos,
        product_image,
        frame_image,
        created_by,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      const rawId = item.product_id ?? item.id ?? item.productId ?? null;
      const rawProductId = String(rawId);
      const rawCode = String(item.gift_box_id || rawProductId || "").trim();
      const isNumericId = /^\d+$/.test(String(rawProductId).trim());
      const numericProductId = isNumericId ? Number.parseInt(rawProductId, 10) : 0;
      const selectedSize = String(item.size || item.variant_size || item.selected_size || "Standard").trim();
      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for product ${rawProductId}`);
      }

      const isAlbumItem =
        item.item_type === "album" ||
        Boolean(item.album_id) ||
        rawCode.toUpperCase().startsWith("ALB") ||
        (typeof item.category === "string" && item.category.toLowerCase().includes("album"));

      let processedAsAlbum = false;

      if (isAlbumItem) {
        const albumQuery = isNumericId
          ? `SELECT * FROM albums WHERE id = ? OR product_id = ? OR product_code = ? FOR UPDATE`
          : `SELECT * FROM albums WHERE product_id = ? OR product_code = ? FOR UPDATE`;
        const albumParams = isNumericId ? [numericProductId, rawCode, rawCode] : [rawCode, rawCode];
        const [albumRows] = await connection.query(albumQuery, albumParams);

        if (albumRows.length > 0) {
          const album = albumRows[0];
          let variants = [];
          try {
            variants = Array.isArray(album.variants)
              ? album.variants
              : JSON.parse(album.variants || "[]");
          } catch {
            variants = [];
          }

          const availableStock = Number(album.stock_quantity || 0);

          if (album.stock_status === "Out of Stock" || (availableStock > 0 && availableStock < quantity)) {
            throw new Error(
              `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for album "${album.product_name}"`
            );
          }
        throw new Error(`Invalid quantity for product ${rawId}`);
      }

      const inventory = await resolveOrderItemInventory(connection, item);

      if (inventory.kind === "product") {
        const variants = parseSizeVariants(inventory.record.size_variants);
        const variantIndex = findMatchingVariantIndex(variants, inventory.selectedSize);

        if (variantIndex >= 0) {
          await connection.query(
            `UPDATE products SET size_variants = ?, updated_at = NOW() WHERE id = ?`,
            [JSON.stringify(inventory.variants), inventory.record.id],
          );
        }
      } else if (inventory.kind === "album") {
        const albumVariantPayload = Array.isArray(inventory.variants) ? inventory.variants : parseSizeVariants(inventory.record.variants);
        const albumKey = String(rawId || "").trim();
        const albumRow = await connection.query(
          `SELECT id, product_id FROM albums WHERE id = ? OR CAST(id AS CHAR) = ? OR product_id = ? OR LOWER(product_id) = ? LIMIT 1`,
          [Number(rawId) || 0, albumKey, albumKey, albumKey.toLowerCase()],
        );
        const albumMatch = albumRow?.[0]?.[0] || null;
        const albumIdValue = albumMatch?.id ?? (Number(rawId) || 0);
        const albumProductIdValue = albumMatch?.product_id ?? albumKey;

        const albumVariantTotal = albumVariantPayload.length
          ? albumVariantPayload.reduce((sum, variant) => sum + Number(variant?.stock ?? variant?.quantity ?? 0), 0)
          : Math.max(Number(inventory.record.stock_quantity || 0) - quantity, 0);

        await connection.query(
          `UPDATE albums
           SET variants = ?,
               stock_quantity = ?,
               stock_status = CASE WHEN ? <= 0 THEN 'Out of Stock' ELSE 'In Stock' END,
               updated_at = NOW()
           WHERE id = ? OR CAST(id AS CHAR) = ? OR product_id = ? OR LOWER(product_id) = ?`,
          [
            JSON.stringify(albumVariantPayload),
            albumVariantTotal,
            albumVariantTotal,
            albumIdValue,
            albumIdValue ? String(albumIdValue) : albumKey,
            albumProductIdValue,
            albumProductIdValue.toLowerCase(),
          ],
        );
      } else if (inventory.kind === "gift") {
        const normalizedRawId = String(rawId || "").trim();
        const strippedRawId = normalizedRawId.replace(/^gift[-_\s]*/i, "");
        const giftUpdates = [
          `UPDATE gift_boxes
           SET current_stock = GREATEST(current_stock - ?, 0),
               stock_status = CASE WHEN GREATEST(current_stock - ?, 0) <= 0 THEN 'Out of Stock' ELSE 'Available' END,
               updated_at = NOW()
           WHERE id = ? OR CAST(id AS CHAR) = ? OR gift_box_id = ? OR LOWER(gift_box_id) = ?`,
          [quantity, quantity, Number(rawId) || 0, String(rawId), normalizedRawId, normalizedRawId.toLowerCase()],
        ];

        if (strippedRawId && strippedRawId !== normalizedRawId) {
          giftUpdates[0] += ` OR gift_box_id = ? OR LOWER(gift_box_id) = ?`;
          giftUpdates[1].push(strippedRawId, strippedRawId.toLowerCase());
        }

        await connection.query(giftUpdates[0], giftUpdates[1]);
      }
          if (variants.length > 0) {
            const variantIdx = variants.findIndex(
              (v) =>
                (selectedSize && String(v.size || "").trim().toLowerCase() === selectedSize.toLowerCase()) ||
                (item.color && String(v.color || "").trim().toLowerCase() === String(item.color).trim().toLowerCase())
            );
            if (variantIdx >= 0) {
              const varStock = Number(variants[variantIdx].stock ?? 0);
              variants[variantIdx].stock = Math.max(0, varStock - quantity);
            }
          }

          const nextStock = Math.max(0, availableStock - quantity);
          const nextStatus = nextStock <= 0 ? "Out of Stock" : nextStock <= Number(album.minimum_stock || 5) ? "Low Stock" : "In Stock";
          const unitPrice = Number(item.price || item.unit_price || album.discount_price || album.selling_price || 0);
          const lineTotal = Number(item.total_price || (unitPrice * quantity));

          await connection.query(
            `UPDATE albums 
             SET stock_quantity = ?, 
                 stock_status = ?, 
                 variants = ?, 
                 updated_at = NOW() 
             WHERE id = ?`,
            [nextStock, nextStatus, JSON.stringify(variants), album.id]
          );

          const itemValues = [
            orderId,
            album.id,
            item.product_name || album.product_name,
            item.category || album.sub_category || album.occasion || "Albums",
            selectedSize || album.size || "12 x 18 Inches",
            unitPrice,
            quantity,
            lineTotal,
            item.customization_id || null,
            item.slot_photos ? (typeof item.slot_photos === "string" ? item.slot_photos : JSON.stringify(item.slot_photos)) : null,
            item.product_image || item.preview_image || album.thumbnail_image || null,
            null,
            orderData.created_by || orderData.user_id || null,
            orderData.updated_by || orderData.user_id || null,
          ];

          await connection.query(insertItemQuery, itemValues);
          processedAsAlbum = true;
        }
      }

      const isGiftItem =
        item.item_type === "gift" ||
        Boolean(item.gift_box_id) ||
        rawCode.toUpperCase().startsWith("GBX") ||
        (typeof item.category === "string" && item.category.toLowerCase().includes("gift"));

      let processedAsGift = false;

      if (!processedAsAlbum && isGiftItem) {
        const giftQuery = isNumericId
          ? `SELECT * FROM gift_boxes WHERE id = ? OR gift_box_id = ? FOR UPDATE`
          : `SELECT * FROM gift_boxes WHERE gift_box_id = ? FOR UPDATE`;
        const giftParams = isNumericId ? [numericProductId, rawCode] : [rawCode];
        const [giftRows] = await connection.query(giftQuery, giftParams);

        if (giftRows.length > 0) {
          const giftBox = giftRows[0];
          const availableStock = Number(giftBox.current_stock || 0);

          if (availableStock < quantity) {
            throw new Error(
              `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for gift "${giftBox.name}"`,
            );
          }

          const nextStock = Math.max(0, availableStock - quantity);
          const nextStatus = nextStock <= 0 ? "Out of Stock" : nextStock <= 5 ? "Low Stock" : "Available";
          const unitPrice = Number(item.price || item.unit_price || giftBox.selling_price || 0);
          const lineTotal = Number(item.total_price || (unitPrice * quantity));

          await connection.query(
            `UPDATE gift_boxes 
             SET current_stock = ?, 
                 stock_status = ?, 
                 orders = COALESCE(orders, 0) + 1, 
                 sales_today = COALESCE(sales_today, 0) + ?, 
                 updated_at = NOW() 
             WHERE id = ?`,
            [nextStock, nextStatus, lineTotal, giftBox.id],
          );

          const itemValues = [
            orderId,
            giftBox.id,
            item.product_name || giftBox.name,
            item.category || giftBox.category || "Gift Box",
            selectedSize || giftBox.box_size || "Standard",
            unitPrice,
            quantity,
            lineTotal,
            item.customization_id || null,
            item.slot_photos ? (typeof item.slot_photos === "string" ? item.slot_photos : JSON.stringify(item.slot_photos)) : null,
            item.product_image || giftBox.image || null,
            item.frame_image || null,
            orderData.created_by || orderData.user_id || null,
            orderData.updated_by || orderData.user_id || null,
          ];

          await connection.query(insertItemQuery, itemValues);
          processedAsGift = true;
        }
      }

      if (!processedAsAlbum && !processedAsGift) {
        const [productRows] = numericProductId
          ? await connection.query(
              `SELECT size_variants FROM products WHERE id = ? FOR UPDATE`,
              [numericProductId],
            )
          : [[]];

        if (!productRows.length) {
          // Fallback 1: Check if it exists in gift_boxes table before failing
          const [fallbackGiftRows] = await connection.query(
            isNumericId
              ? `SELECT * FROM gift_boxes WHERE id = ? OR gift_box_id = ? FOR UPDATE`
              : `SELECT * FROM gift_boxes WHERE gift_box_id = ? FOR UPDATE`,
            isNumericId ? [numericProductId, rawCode] : [rawCode],
          );

          if (fallbackGiftRows.length > 0) {
            const giftBox = fallbackGiftRows[0];
            const availableStock = Number(giftBox.current_stock || 0);

            if (availableStock < quantity) {
              throw new Error(
                `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for gift "${giftBox.name}"`,
              );
            }

            const nextStock = Math.max(0, availableStock - quantity);
            const nextStatus = nextStock <= 0 ? "Out of Stock" : nextStock <= 5 ? "Low Stock" : "Available";
            const unitPrice = Number(item.price || item.unit_price || giftBox.selling_price || 0);
            const lineTotal = Number(item.total_price || (unitPrice * quantity));

            await connection.query(
              `UPDATE gift_boxes 
               SET current_stock = ?, 
                   stock_status = ?, 
                   orders = COALESCE(orders, 0) + 1, 
                   sales_today = COALESCE(sales_today, 0) + ?, 
                   updated_at = NOW() 
               WHERE id = ?`,
              [nextStock, nextStatus, lineTotal, giftBox.id],
            );

            const itemValues = [
              orderId,
              giftBox.id,
              item.product_name || giftBox.name,
              item.category || giftBox.category || "Gift Box",
              selectedSize || giftBox.box_size || "Standard",
              unitPrice,
              quantity,
              lineTotal,
              item.customization_id || null,
              item.slot_photos ? (typeof item.slot_photos === "string" ? item.slot_photos : JSON.stringify(item.slot_photos)) : null,
              item.product_image || giftBox.image || null,
              item.frame_image || null,
              orderData.created_by || orderData.user_id || null,
              orderData.updated_by || orderData.user_id || null,
            ];

            await connection.query(insertItemQuery, itemValues);
            continue;
          }

          // Fallback 2: Check if it exists in albums table before failing
          const [fallbackAlbumRows] = await connection.query(
            isNumericId
              ? `SELECT * FROM albums WHERE id = ? OR product_id = ? OR product_code = ? FOR UPDATE`
              : `SELECT * FROM albums WHERE product_id = ? OR product_code = ? FOR UPDATE`,
            isNumericId ? [numericProductId, rawCode, rawCode] : [rawCode, rawCode],
          );

          if (fallbackAlbumRows.length > 0) {
            const album = fallbackAlbumRows[0];
            let variants = [];
            try {
              variants = Array.isArray(album.variants)
                ? album.variants
                : JSON.parse(album.variants || "[]");
            } catch {
              variants = [];
            }

            const availableStock = Number(album.stock_quantity || 0);

            if (album.stock_status === "Out of Stock" || (availableStock > 0 && availableStock < quantity)) {
              throw new Error(
                `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for album "${album.product_name}"`
              );
            }

            if (variants.length > 0) {
              const variantIdx = variants.findIndex(
                (v) =>
                  (selectedSize && String(v.size || "").trim().toLowerCase() === selectedSize.toLowerCase()) ||
                  (item.color && String(v.color || "").trim().toLowerCase() === String(item.color).trim().toLowerCase())
              );
              if (variantIdx >= 0) {
                const varStock = Number(variants[variantIdx].stock ?? 0);
                variants[variantIdx].stock = Math.max(0, varStock - quantity);
              }
            }

            const nextStock = Math.max(0, availableStock - quantity);
            const nextStatus = nextStock <= 0 ? "Out of Stock" : nextStock <= Number(album.minimum_stock || 5) ? "Low Stock" : "In Stock";
            const unitPrice = Number(item.price || item.unit_price || album.discount_price || album.selling_price || 0);
            const lineTotal = Number(item.total_price || (unitPrice * quantity));

            await connection.query(
              `UPDATE albums 
               SET stock_quantity = ?, 
                   stock_status = ?, 
                   variants = ?, 
                   updated_at = NOW() 
               WHERE id = ?`,
              [nextStock, nextStatus, JSON.stringify(variants), album.id]
            );

            const itemValues = [
              orderId,
              album.id,
              item.product_name || album.product_name,
              item.category || album.sub_category || album.occasion || "Albums",
              selectedSize || album.size || "12 x 18 Inches",
              unitPrice,
              quantity,
              lineTotal,
              item.customization_id || null,
              item.slot_photos ? (typeof item.slot_photos === "string" ? item.slot_photos : JSON.stringify(item.slot_photos)) : null,
              item.product_image || item.preview_image || album.thumbnail_image || null,
              null,
              orderData.created_by || orderData.user_id || null,
              orderData.updated_by || orderData.user_id || null,
            ];

            await connection.query(insertItemQuery, itemValues);
            continue;
          }

          throw new Error(`Product ${rawProductId} was not found`);
        }

        const variants = parseSizeVariants(productRows[0].size_variants);
        const variantIndex = variants.findIndex(
          (variant) =>
            String(variant.size || "").trim().toLowerCase() === selectedSize.toLowerCase(),
        );

        if (variantIndex < 0) {
          throw new Error(`Selected size "${selectedSize}" is not available for product ${numericProductId}`);
        }

        const availableStock = Number(variants[variantIndex].stock ?? 0);
        if (availableStock < quantity) {
          throw new Error(
            `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available for size "${selectedSize}"`,
          );
        }

        variants[variantIndex] = {
          ...variants[variantIndex],
          stock: availableStock - quantity,
        };

        await connection.query(
          `UPDATE products SET size_variants = ?, updated_at = NOW() WHERE id = ?`,
          [JSON.stringify(variants), numericProductId],
        );

        const itemValues = [
          orderId,
          numericProductId || rawId,
          inventory.productName || item.product_name || "Custom Frame",
          inventory.category || item.category || "Photo Frames",
          inventory.selectedSize || selectedSize || "Standard",
          Number(item.price || item.unit_price || 0),
          quantity,
          Number(item.total_price || (Number(item.price || item.unit_price || 0) * quantity)),
          item.customization_id || null,
          item.slot_photos ? (typeof item.slot_photos === "string" ? item.slot_photos : JSON.stringify(item.slot_photos)) : null,
          item.product_image || null,
          item.frame_image || null,
          orderData.created_by || orderData.user_id || null,
          orderData.updated_by || orderData.user_id || null,
        ];

        await connection.query(insertItemQuery, itemValues);
      }
    }

    if (address) {
      const customerId = address.customer_id || null;
      const userId = address.user_id || null;
      const addressValues = [
        customerId,
        userId,
        String(address.customer_name || orderData.customer_name || "").trim(),
        String(address.mobile_number || orderData.customer_phone || "").trim(),
        String(address.address_line1 || "").trim(),
        String(address.address_line2 || "").trim(),
        String(address.city || orderData.city || "").trim(),
        String(address.district || "").trim(),
        String(address.state || orderData.state || "").trim(),
        String(address.country || "").trim(),
        String(address.pincode || orderData.pincode || "").trim(),
        String(address.landmark || "").trim(),
      ];
      const addressFieldValues = addressValues.slice(2).map((value) => value.toLowerCase());

      const [existingAddresses] = await connection.query(
        `SELECT id FROM addresses
         WHERE ((? IS NOT NULL AND customer_id = ?)
            OR (? IS NULL AND user_id = ?))
           AND LOWER(COALESCE(customer_name, '')) = ?
           AND LOWER(COALESCE(mobile_number, '')) = ?
           AND LOWER(COALESCE(address_line1, '')) = ?
           AND LOWER(COALESCE(address_line2, '')) = ?
           AND LOWER(COALESCE(city, '')) = ?
           AND LOWER(COALESCE(district, '')) = ?
           AND LOWER(COALESCE(state, '')) = ?
           AND LOWER(COALESCE(country, '')) = ?
           AND LOWER(COALESCE(pincode, '')) = ?
           AND LOWER(COALESCE(landmark, '')) = ?
         LIMIT 1`,
        [customerId, customerId, customerId, userId, ...addressFieldValues],
      );

      if (!existingAddresses.length) {
        await connection.query(
          `INSERT INTO addresses (
            address_id, user_id, customer_id, order_id, address_type,
            customer_name, mobile_number, address_line1, address_line2,
            city, district, state, country, pincode, landmark,
            created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `ADDR-${randomUUID()}`,
            address.user_id || null,
            address.customer_id || null,
            orderId,
            address.address_type || "Shipping",
            ...addressValues.slice(2),
            orderData.created_by || orderData.user_id || null,
            orderData.updated_by || orderData.user_id || null,
          ],
        );
      }
    }

    await connection.commit();

    return {
      id: orderResult.insertId,
      order_id: orderId,
      ...orderData,
      items,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllOrders = async (filters = {}) => {
  const pool = getDB();
  let query = `
    SELECT 
      o.*,
      COUNT(oi.id) AS item_count,
      GROUP_CONCAT(oi.product_name SEPARATOR ', ') AS product_names
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE 1=1
  `;
  const values = [];

  if (filters.status && filters.status !== "All" && filters.status !== "All Status") {
    query += ` AND o.order_status = ?`;
    values.push(filters.status);
  }

  if (filters.billing_type) {
    query += ` AND o.billing_type = ?`;
    values.push(filters.billing_type);
  }

  if (filters.today === "1" || filters.today === "true") {
    query += ` AND o.created_at >= CURDATE() AND o.created_at < CURDATE() + INTERVAL 1 DAY`;
  }

  if (filters.search) {
    query += ` AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ? OR o.customer_email LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    values.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

  const [rows] = await pool.query(query, values);
  return rows;
};

const getOrderById = async (orderId) => {
  const pool = getDB();
  const isNumeric = !isNaN(orderId) && String(orderId).trim() !== "";

  const orderQuery = isNumeric
    ? `SELECT * FROM orders WHERE id = ? OR order_id = ? LIMIT 1`
    : `SELECT * FROM orders WHERE order_id = ? LIMIT 1`;

  const orderParams = isNumeric ? [orderId, String(orderId)] : [orderId];

  const [orderRows] = await pool.query(orderQuery, orderParams);

  if (!orderRows.length) return null;

  const order = orderRows[0];

  const itemsQuery = `
    SELECT 
      oi.*,
      cp.preview_image AS customized_preview_image
    FROM order_items oi 
    LEFT JOIN customized_photos cp ON oi.customization_id = cp.customization_id
    WHERE oi.order_id = ? 
    ORDER BY oi.id ASC
  `;
  const [itemRows] = await pool.query(itemsQuery, [order.order_id]);

  const items = itemRows.map((item) => ({
    ...item,
    slot_photos:
      typeof item.slot_photos === "string"
        ? JSON.parse(item.slot_photos)
        : item.slot_photos || {},
    whole_frame_image:
      item.customized_preview_image ||
      item.product_image ||
      item.frame_image ||
      null,
  }));

  return {
    ...order,
    items,
  };
};

const getOrdersByUser = async (userId) => {
  const pool = getDB();
  const query = `
    SELECT 
      o.*,
      COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const [rows] = await pool.query(query, [userId]);
  return rows;
};

const updateOrderStatus = async (orderId, updateData) => {
  const pool = getDB();
  const { order_status, payment_status, shipped_at, docket_number, courier_name, notes, updated_by } = updateData;

  let query = `UPDATE orders SET updated_at = NOW()`;
  const values = [];

  if (order_status) {
    query += `, order_status = ?`;
    values.push(order_status);
  }

  if (payment_status) {
    query += `, payment_status = ?`;
    values.push(payment_status);
  }

  if (order_status === "Shipped" || order_status === "SHIPPED") {
    query += `, shipped_at = ?, docket_number = ?, courier_name = ?`;
    values.push(shipped_at || null, docket_number || null, courier_name || null);
  } else if (order_status === "Cancelled" || order_status === "CANCELLED") {
    query += `, shipped_at = NULL, docket_number = NULL, courier_name = NULL`;
    if (notes?.trim()) {
      query += `, notes = ?`;
      values.push(notes.trim());
    }
  }

  if (updated_by) {
    query += `, updated_by = ?`;
    values.push(updated_by);
  }

  query += ` WHERE order_id = ? OR id = ?`;
  values.push(orderId, orderId);

  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

const deleteOrder = async (orderId) => {
  const pool = getDB();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT order_id FROM orders WHERE id = ? OR order_id = ? LIMIT 1`,
      [orderId, orderId]
    );

    if (!orders.length) {
      await connection.rollback();
      return false;
    }

    const actualOrderId = orders[0].order_id;

    await connection.query(`DELETE FROM order_items WHERE order_id = ?`, [actualOrderId]);
    const [result] = await connection.query(`DELETE FROM orders WHERE order_id = ?`, [actualOrderId]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrder,
  resolveOrderItemInventory,
  getAllOrders,
  getOrders: getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};

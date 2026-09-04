const { getDB } = require("../config/db");

const createEnquiry = async (enquiryData) => {
  const pool = getDB();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [lastEnquiries] = await connection.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(enquiry_id, 4) AS UNSIGNED)), 0) AS last_number
       FROM enquiries WHERE enquiry_id REGEXP '^ENQ[0-9]+$' FOR UPDATE`
    );
    const nextNumber = Number(lastEnquiries[0]?.last_number || 0) + 1;
    const enquiryId = `ENQ${String(nextNumber).padStart(3, "0")}`;
    const query = `
    INSERT INTO enquiries (
      enquiry_id, customer_name, mobile_number, whatsapp_number, email,
      enquiry_type, product_category, product_name, frame_image, quantity, budget, message,
      size, frame_type, customization, reference_image, uploaded_images, status, priority,
      source, assigned_to, follow_up_date, follow_up_notes, quotation_amount,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
    enquiryId,
    enquiryData.customerName,
    enquiryData.mobileNumber,
    enquiryData.whatsappNumber || "",
    enquiryData.email || "",
    enquiryData.enquiryType || "",
    enquiryData.productCategory || "",
    enquiryData.productName || "",
    enquiryData.frameImage || "",
    Number(enquiryData.quantity || 1),
    Number(enquiryData.budget || 0),
    enquiryData.message || "",
    enquiryData.size || "",
    enquiryData.frameType || "",
    enquiryData.customization || "",
    enquiryData.referenceImage || "",
    JSON.stringify(enquiryData.uploadedImages || []),
    enquiryData.status || "New",
    enquiryData.priority || "Medium",
    enquiryData.source || "Website",
    enquiryData.assignedTo || "Admin",
    enquiryData.followUpDate || null,
    enquiryData.followUpNotes || "",
    Number(enquiryData.quotationAmount || 0),
    enquiryData.createdAt || new Date(),
    enquiryData.updatedAt || new Date(),
    ];

    const [result] = await connection.query(query, values);
    await connection.commit();
    return { id: result.insertId, ...enquiryData, enquiryId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllEnquiries = async () => {
  const pool = getDB();
  const [rows] = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC");
  return rows;
};

const updateEnquiry = async (enquiryId, enquiryData) => {
  const pool = getDB();
  const query = `
    UPDATE enquiries SET
      customer_name = ?, mobile_number = ?, whatsapp_number = ?, email = ?,
      enquiry_type = ?, product_category = ?, product_name = ?, frame_image = ?, quantity = ?, budget = ?, message = ?,
      size = ?, frame_type = ?, customization = ?, reference_image = ?, uploaded_images = ?, status = ?, priority = ?, source = ?, assigned_to = ?,
      follow_up_date = ?, follow_up_notes = ?, quotation_amount = ?, updated_at = ?
    WHERE enquiry_id = ? OR id = ?
  `;
  const values = [
    enquiryData.customerName, enquiryData.mobileNumber, enquiryData.whatsappNumber || "", enquiryData.email || "",
    enquiryData.enquiryType || "", enquiryData.productCategory || "", enquiryData.productName || "",
    enquiryData.frameImage || "",
    Number(enquiryData.quantity || 1), Number(enquiryData.budget || 0), enquiryData.message || "",
    enquiryData.size || "", enquiryData.frameType || "", enquiryData.customization || "", enquiryData.referenceImage || "",
    JSON.stringify(enquiryData.uploadedImages || []), enquiryData.status || "New",
    enquiryData.priority || "Medium", enquiryData.source || "Website", enquiryData.assignedTo || "Admin",
    enquiryData.followUpDate || null, enquiryData.followUpNotes || "", Number(enquiryData.quotationAmount || 0),
    enquiryData.updatedAt || new Date(), enquiryId, enquiryId,
  ];
  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

const deleteEnquiry = async (enquiryId) => {
  const pool = getDB();
  const [result] = await pool.query("DELETE FROM enquiries WHERE enquiry_id = ? OR id = ?", [enquiryId, enquiryId]);
  return result.affectedRows > 0;
};

module.exports = { createEnquiry, getAllEnquiries, updateEnquiry, deleteEnquiry };

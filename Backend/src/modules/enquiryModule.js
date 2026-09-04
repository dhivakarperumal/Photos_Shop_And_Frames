const { getDB } = require("../config/db");
const { randomUUID } = require("crypto");

const createEnquiry = async (enquiryData) => {
  const pool = getDB();
  const enquiryId = enquiryData.enquiryId || `ENQ-${randomUUID().slice(0, 8).toUpperCase()}`;
  const query = `
    INSERT INTO enquiries (
      enquiry_id, customer_name, mobile_number, whatsapp_number, email,
      enquiry_type, product_category, product_name, quantity, budget, message,
      size, frame_type, customization, reference_image, status, priority,
      source, assigned_to, follow_up_date, follow_up_notes, quotation_amount,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    Number(enquiryData.quantity || 1),
    Number(enquiryData.budget || 0),
    enquiryData.message || "",
    enquiryData.size || "",
    enquiryData.frameType || "",
    enquiryData.customization || "",
    enquiryData.referenceImage || "",
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

  const [result] = await pool.query(query, values);
  return { id: result.insertId, ...enquiryData, enquiryId };
};

const getAllEnquiries = async () => {
  const pool = getDB();
  const [rows] = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC");
  return rows;
};

module.exports = { createEnquiry, getAllEnquiries };

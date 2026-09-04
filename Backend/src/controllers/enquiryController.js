const enquiryModule = require("../modules/enquiryModule");

const createEnquiry = async (req, res) => {
  try {
    const { customerName, mobileNumber } = req.body;
    if (!String(customerName || "").trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }
    if (!String(mobileNumber || "").trim()) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const enquiry = await enquiryModule.createEnquiry({
      ...req.body,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
    });

    return res.status(201).json({ success: true, message: "Enquiry created successfully", data: enquiry });
  } catch (error) {
    console.error("Create enquiry error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This enquiry ID already exists. Please use a different ID." });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to create enquiry" });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await enquiryModule.getAllEnquiries();
    return res.status(200).json({ success: true, data: enquiries, count: enquiries.length });
  } catch (error) {
    console.error("Get enquiries error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load enquiries" });
  }
};

const updateEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { customerName, mobileNumber } = req.body;
    if (!String(customerName || "").trim() || !String(mobileNumber || "").trim()) {
      return res.status(400).json({ success: false, message: "Customer name and mobile number are required" });
    }
    const updated = await enquiryModule.updateEnquiry(enquiryId, {
      ...req.body, customerName: customerName.trim(), mobileNumber: mobileNumber.trim(), updatedAt: new Date(),
    });
    if (!updated) return res.status(404).json({ success: false, message: "Enquiry not found" });
    return res.status(200).json({ success: true, message: "Enquiry updated successfully" });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update enquiry" });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const deleted = await enquiryModule.deleteEnquiry(req.params.enquiryId);
    if (!deleted) return res.status(404).json({ success: false, message: "Enquiry not found" });
    return res.status(200).json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Delete enquiry error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete enquiry" });
  }
};

module.exports = { createEnquiry, getAllEnquiries, updateEnquiry, deleteEnquiry };

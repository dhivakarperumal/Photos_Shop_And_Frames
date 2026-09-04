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

module.exports = { createEnquiry, getAllEnquiries };

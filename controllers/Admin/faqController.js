const FAQ = require("../../models/Admin/faqModel");

// Get all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.status(200).json(faqs);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch FAQs", details: err.message });
  }
};

// Get single FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    res.status(200).json(faq);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch FAQ", details: err.message });
  }
};

// Create new FAQ
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFaq = new FAQ({ question, answer });
    const savedFaq = await newFaq.save();
    res.status(201).json(savedFaq);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to create FAQ", details: err.message });
  }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const updatedFaq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedFaq) return res.status(404).json({ error: "FAQ not found" });
    res.status(200).json(updatedFaq);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to update FAQ", details: err.message });
  }
};

// Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const deletedFaq = await FAQ.findByIdAndDelete(req.params.id);
    if (!deletedFaq) return res.status(404).json({ error: "FAQ not found" });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete FAQ", details: err.message });
  }
};

const express = require("express");

const router = express.Router();

const { runAgent } = require("../services/aiAgent");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    console.log("AI REQUEST:", message);

    // IMPORTANT: declare result here
    const result = await runAgent(message.trim());

    console.log("AI RESULT:", result);

    return res.status(200).json({
      success: true,
      answer: result.answer || "",
      sources: result.sources || []
    });

  } catch (error) {
    console.error("AI Error:", error);

    if (
      error.message &&
      error.message.toLowerCase().includes("quota")
    ) {
      return res.status(429).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "AI request failed"
    });
  }
});

module.exports = router;
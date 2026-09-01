const {
  indexKnowledge,
  askRAG
} = require("../services/ragService");


const index = async (req, res) => {
  try {
    const result = await indexKnowledge();

    res.status(200).json({
      status: "success",
      message: "Knowledge indexed successfully",
      data: result
    });

  } catch (error) {
    console.error("Index error:", error);
    res.status(500).json({
     status: "error",
      message: "Failed to index knowledge",
      error: error.message
    });

  }

};


const ask = async (req, res) => {
  try {
    const {question} = req.body;

    if (
      !question ||
      !question.trim()
    ) {

      return res.status(400).json({
       status: "error",
        message:"Question is required"
      });
    }

    const result =
      await askRAG(
        question.trim()
      );

    res.status(200).json({
      status: "success",
      data:result
    });


  } catch (error) {
    console.error("RAG error:",error);
    res.status(500).json({
      status: "error",
      message:"RAG failed",
      error: error.message
    });

  }

};


module.exports = {
  index,
  ask
};
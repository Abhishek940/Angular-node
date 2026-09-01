require("dotenv").config();

const fs = require("fs");
const path = require("path");

const Knowledge = require("../models/knowledgeModel");

// ========================================
// gemini client
// ========================================

let ai = null;

async function getGeminiClient() {
  if (!ai) {
    const { GoogleGenAI } = await import("@google/genai");

    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return ai;
}

// ========================================
// MODELS
// ========================================

const EMBEDDING_MODEL = "gemini-embedding-001";
const LLM_MODEL = "gemini-2.5-flash";

// ========================================
// LOAD KNOWLEDGE FILES
// ========================================

async function loadKnowledge() {
  const knowledgeDir = path.join(__dirname, "../knowledge");
  const files = fs.readdirSync(knowledgeDir);
  const documents = [];

  for (const file of files) {
    if (!file.endsWith(".txt")) {
      continue;
    }

    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    if (!content.trim()) {
      continue;
    }

    documents.push({
      source: file,
      content: content.trim(),
    });
  }

  return documents;
}

// ========================================
// CHUNK TEXT
// ========================================

function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end === text.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}

// ========================================
// CREATE DOCUMENT EMBEDDING
// ========================================

async function createEmbedding(text) {
  const ai = await getGeminiClient();

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });

  return response.embeddings[0].values;
}

// ========================================
// CREATE QUERY EMBEDDING
// ========================================

async function createQueryEmbedding(text) {
  const ai = await getGeminiClient();

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_QUERY",
    },
  });

  return response.embeddings[0].values;
}

// ========================================
// index knowledge
// ========================================

async function indexKnowledges() {
  const documents = await loadKnowledge();
  let totalChunks = 0;
  for (const document of documents) {
    console.log(`\nSOURCE: ${document.source}`);

    // Delete old embeddings
    // for this file
    await Knowledge.deleteMany({
      source: document.source,
    });
   const chunks = chunkText(document.content);
   for (let i = 0; i < chunks.length; i++) {
      console.log(`Creating embedding ${i + 1}/${chunks.length}`);
      const embedding = await createEmbedding(chunks[i]);
      await Knowledge.create({
        source: document.source,
        chunkIndex: i,
        text: chunks[i],
        embedding: embedding,
      });
      totalChunks++;
    }
  }

  console.log("\n================================");
  console.log(`indexing: ${totalChunks} chunks`);
  console.log("================================");
  return {
    documents: documents.length,
    chunks: totalChunks,
  };
}

// ========================================
// index for all knowledge
// ========================================

async function indexKnowledge() {
  console.log("\n================================");
  console.log("KNOWLEDGE INDEXING");
  console.log("================================");

  const documents = await loadKnowledge();
  let totalChunks = 0;
  for (const document of documents) {
    console.log(`\nSOURCE: ${document.source}`);
    await Knowledge.deleteMany({
      source: document.source,
    });

    const chunks = chunkText(document.content);
    for (let i = 0; i < chunks.length; i++) {
      console.log(
        `Creating embedding ${i + 1}/${chunks.length}`
      );
      const embedding = await createEmbedding(chunks[i]);
      await Knowledge.create({
        source: document.source,
        chunkIndex: i,
        text: chunks[i],
        embedding: embedding,
      });

      totalChunks++;
    }
  }

  console.log("\n================================");
  console.log(`INDEXING COMPLETE: ${totalChunks} chunks`);
  console.log("================================");

  return {
    documents: documents.length,
    chunks: totalChunks,
  };
}


// ========================================
// WATCH KNOWLEDGE FILES
// ========================================

function watchKnowledgeFiles() {
  const knowledgeDir = path.join(__dirname, "../knowledge");
  console.log("\n================================");
  console.log("KNOWLEDGE FILE WATCHER STARTED");
  console.log(`Watching: ${knowledgeDir}`);
  console.log("================================");
  fs.watch(
    knowledgeDir,
    async (eventType, filename) => {
      if (!filename) {
        return;
      }

      if (!filename.endsWith(".txt")) {
        return;
      }

      console.log(`\nFile event: ${eventType} -> ${filename}`);

      // Small delay because some editors
      // trigger multiple file events
      setTimeout(async () => {
        try {
          await indexKnowledgeFile(filename);
        } catch (error) {
          console.error(
            `Error updating ${filename}:`,
            error
          );

        }

      }, 500);
    }
  );
}

// ========================================
// COSINE SIMILARITY
// ========================================

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// ========================================
// SEARCH KNOWLEDGE
// ========================================

async function searchKnowledge(question, topK = 3) {

  console.log("\nCreating query embedding...");
  const queryEmbedding = await createQueryEmbedding(question);
  console.log("Query vector dimensions:",queryEmbedding.length);
  const documents = await Knowledge.find({}).lean();
  if (!documents.length) {
    return [];
  }

  const results = documents.map((document) => {
  const score = cosineSimilarity(queryEmbedding,document.embedding);

    return {
      source: document.source,
      chunkIndex: document.chunkIndex,
      text: document.text,
      score: score
    };

  });

  results.sort(
    (a, b) => b.score - a.score
  );

  console.log("\nSimilarity results:");
  results.forEach((result) => {
    console.log(`${result.source} -> ${result.score.toFixed(4)}`);

  });

  // Only return reasonably relevant documents
  const relevantResults = results.filter(result => result.score >= 0.55);
  return relevantResults.slice(0, topK);
}

// ========================================
// GENERATE RAG ANSWER
// ========================================

async function askRAG(question) {
  console.log("\n================================");
  console.log("RAG QUESTION:", question);
  console.log("================================");
  // ========================================
  // STEP 1: SEARCH KNOWLEDGE
  // ========================================

  const results = await searchKnowledge(question, 3);
  console.log("\nRetrieved documents:");
  results.forEach((result, index) => {
  console.log(`${index + 1}. ${result.source} - score: ${result.score.toFixed(4)}`);
  });

  // ========================================
  // NO RELEVANT KNOWLEDGE
  // ========================================

  if (!results.length) {
    return {
      answer:
        "I don't have enough information in my knowledge base to answer that.",
      sources: []
    };
  }

  // ========================================
  // STEP 2: CREATE CONTEXT
  // ========================================

  const context = results.map((result, index) =>
    {return `SOURCE ${index + 1}FILE: ${result.source}
   CONTENT: ${result.text}`;})
      .join("\n-----------------------------\n");

  console.log("\n================ CONTEXT ================");
  console.log(context);
  console.log("==========================================");
  // ========================================
  // STEP 3: PROMPT
  // ========================================
 const prompt = `
You are a helpful AI assistant.

Answer the user's question using ONLY the information
provided in the CONTEXT.

IMPORTANT RULES:

1. Use only information from the CONTEXT.
2. Do not invent or assume information.
3. If the CONTEXT contains multiple sentences that
   answer the question, include all relevant information.
4. Do not unnecessarily shorten the answer.
5. Preserve important details from the CONTEXT.
6. If the answer cannot be found in the CONTEXT, say exactly:

"I don't have enough information in my knowledge base to answer that."

7. Answer naturally and directly.
8. Do not mention "CONTEXT", "RAG", embeddings, scores,
   sources, or internal processing.

CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;
  // ========================================
  // STEP 4: GEMINI
  // ========================================

  const ai = await getGeminiClient();

  const response =
    await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt
    });

  const answer = response.text || "";
  return {
    answer:
      answer ||
      "Unable to generate an answer.",
    sources:
      results.map(result => ({
        source:
        result.source,
        chunkIndex:
          result.chunkIndex,
        score:
          Number(
            result.score.toFixed(4)
          ),
        text:
          result.text

      }))

  };
}

module.exports = {
  loadKnowledge,
  chunkText,
  createEmbedding,
  createQueryEmbedding,
  indexKnowledge,
  watchKnowledgeFiles,
  searchKnowledge,
  askRAG,
};

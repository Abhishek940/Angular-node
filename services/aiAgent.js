const {
  getAllProducts,
  searchProducts,
  getCheapestProduct,
  getMostExpensiveProduct,
  getProductCount,
  createProduct,
  updateProduct,
  deleteProduct
} = require("./productTools");

const { askRAG } = require("./ragService");


// =====================================================
// RUN AGENT
// =====================================================

async function runAgent(message) {

  console.log("\n================================");
  console.log("AI AGENT STARTED");
  console.log("USER:", message);
  console.log("================================");

  try {

    const { GoogleGenAI, Type } =
      await import("@google/genai");


    // =====================================================
    // GEMINI CLIENT
    // =====================================================

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });


    // =====================================================
    // PRODUCT TOOLS
    // =====================================================

    const tools = [
      {
        functionDeclarations: [

          {
            name: "getAllProducts",

            description:
              "Get all actual products from MongoDB.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "searchProducts",

            description:
              "Search actual MongoDB products by product name or keyword.",

            parameters: {

              type: Type.OBJECT,

              properties: {

                search: {
                  type: Type.STRING,
                  description:
                    "Product name or keyword."
                }

              },

              required: ["search"]
            }
          },


          {
            name: "getCheapestProduct",

            description:
              "Find the actual product with the lowest price in MongoDB.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "getMostExpensiveProduct",

            description:
              "Find the actual product with the highest price in MongoDB.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "getProductCount",

            description:
              "Get the total number of actual products stored in MongoDB.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "createProduct",

            description:
              "Create a new product in MongoDB.",

            parameters: {

              type: Type.OBJECT,

              properties: {

                name: {
                  type: Type.STRING
                },

                price: {
                  type: Type.NUMBER
                },

                quantity: {
                  type: Type.NUMBER
                }

              },

              required: [
                "name",
                "price",
                "quantity"
              ]
            }
          },


          {
            name: "updateProduct",

            description:
              "Update an existing product in MongoDB.",

            parameters: {

              type: Type.OBJECT,

              properties: {

                name: {
                  type: Type.STRING
                },

                price: {
                  type: Type.NUMBER
                },

                quantity: {
                  type: Type.NUMBER
                }

              },

              required: [
                "name",
                "price",
                "quantity"
              ]
            }
          },


          {
            name: "deleteProduct",

            description:
              "Delete an existing product from MongoDB.",

            parameters: {

              type: Type.OBJECT,

              properties: {

                name: {
                  type: Type.STRING
                }

              },

              required: ["name"]
            }
          }

        ]
      }
    ];


    // =====================================================
    // STEP 1
    // CLASSIFY QUESTION
    // =====================================================

    console.log("\nClassifying question...");

    const classificationPrompt = `

Classify the user's question into exactly ONE category.

Return ONLY:

PRODUCT
RAG
GENERAL

---------------------------------------------------
PRODUCT
---------------------------------------------------

Use PRODUCT when the question is about actual
products stored in MongoDB.

Examples:

What is the cheapest product?
What is the most expensive product?
What is the price of Mobile?
How many products are there?
Show all products
Find laptop
Search mobile
Create a product
Update a product
Delete a product

---------------------------------------------------
RAG
---------------------------------------------------

Use RAG when the answer must come from the application's
knowledge base.

The knowledge base contains:

- company information
- company name
- company history
- company location
- company services
- company mission
- founder
- return policy

Examples:

What is the company name?
Who is the founder?
Where is the company located?
What does the company do?
What services does the company provide?
What is the company mission?
What is the return policy?
Can I return a product?

---------------------------------------------------
GENERAL
---------------------------------------------------

Use GENERAL for general programming, technical,
or common knowledge questions.

Examples:

What is Node.js?
What is Angular?
Explain MongoDB.
What is Express?
What is JavaScript?
What is TypeScript?
Explain REST API.
What is Agentic AI?

---------------------------------------------------

USER QUESTION:

${message}

Return ONLY ONE WORD.
`;


    const classificationResponse =
      await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: classificationPrompt

      });


    const category =
      (classificationResponse.text || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "");


    console.log(
      "CLASSIFICATION:",
      category
    );


    // =====================================================
    // STEP 2
    // RAG
    // =====================================================

    if (category === "RAG") {

      console.log("\nRAG QUESTION");

      const ragResult =
        await askRAG(message);

      console.log(
        "RAG RESULT:",
        ragResult
      );


      return {

        answer:
          ragResult.answer || "",

        sources:
          ragResult.sources || []

      };

    }


    // =====================================================
    // STEP 3
    // GENERAL
    // =====================================================

    if (category === "GENERAL") {

      console.log(
        "\nGENERAL QUESTION"
      );


      const generalResponse =
        await ai.models.generateContent({

          model: "gemini-3.6-flash",

          contents: message,

          config: {

            systemInstruction: `

You are a helpful AI assistant.

Answer the user's general question using
your normal knowledge.

You can answer questions about:

- Angular
- Node.js
- Express
- MongoDB
- JavaScript
- TypeScript
- REST API
- Agentic AI
- programming
- software development
- general technology

Do NOT use MongoDB product data.

Do NOT use the application's RAG knowledge base.

Give a clear and useful answer.

`

          }

        });


      return {

        answer:
          generalResponse.text || "",

        sources: []

      };

    }


    // =====================================================
    // STEP 4
    // PRODUCT
    // =====================================================

    console.log(
      "\nPRODUCT QUESTION"
    );


    const productResponse =
      await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: message,

        config: {

          systemInstruction: `

You are a Product Management AI agent.

The application contains actual products
stored in MongoDB.

You MUST use a MongoDB product tool.

Never invent product information.

Examples:

"What is the cheapest product?"
-> getCheapestProduct

"What is the most expensive product?"
-> getMostExpensiveProduct

"How many products?"
-> getProductCount

"Show all products"
-> getAllProducts

"Find laptop"
-> searchProducts

"What is the price of Mobile?"
-> searchProducts

"Search mobile"
-> searchProducts

"Create iPhone price 80000 quantity 5"
-> createProduct

"Update laptop price to 50000 quantity 10"
-> updateProduct

"Delete iPhone"
-> deleteProduct

`,

          tools

        }

      });


    const functionCalls =
      productResponse.functionCalls || [];


    console.log(
      "PRODUCT FUNCTION CALLS:",
      functionCalls.length
    );


    // =====================================================
    // NO TOOL
    // =====================================================

    if (functionCalls.length === 0) {

      return {

        answer:
          "I could not determine the requested product operation.",

        sources: []

      };

    }


    // =====================================================
    // EXECUTE PRODUCT TOOL
    // =====================================================

    const results = [];


    for (const call of functionCalls) {

      console.log(
        "\n================================"
      );

      console.log(
        "SELECTED TOOL:",
        call.name
      );

      console.log(
        "ARGUMENTS:",
        call.args
      );


      let result;


      switch (call.name) {

        case "getAllProducts":

          result =
            await getAllProducts();

          break;


        case "searchProducts":

          result =
            await searchProducts(
              call.args?.search
            );

          break;


        case "getCheapestProduct":

          result =
            await getCheapestProduct();

          break;


        case "getMostExpensiveProduct":

          result =
            await getMostExpensiveProduct();

          break;


        case "getProductCount":

          result =
            await getProductCount();

          break;


        case "createProduct":

          result =
            await createProduct(
              call.args?.name,
              call.args?.price,
              call.args?.quantity
            );

          break;


        case "updateProduct":

          result =
            await updateProduct(
              call.args?.name,
              call.args?.price,
              call.args?.quantity
            );

          break;


        case "deleteProduct":

          result =
            await deleteProduct(
              call.args?.name
            );

          break;


        default:

          result = {
            error:
              `Unknown tool: ${call.name}`
          };

      }


      console.log(
        "DATABASE RESULT:",
        result
      );


      results.push({

        tool:
          call.name,

        result

      });

    }


    // =====================================================
    // FINAL PRODUCT ANSWER
    // =====================================================

    const finalPrompt = `

Answer the user's question using ONLY the
MongoDB result below.

USER QUESTION:

${message}

MONGODB RESULT:

${JSON.stringify(
  results,
  null,
  2
)}

Rules:

1. Use ONLY the MongoDB result.
2. Never invent product information.
3. Do not mention internal tool names.
4. Answer clearly and naturally.
5. Mention product name when available.
6. Mention price when available.
7. Mention quantity when available.
8. If no matching product exists, say that
   the product was not found.

`;


    const finalResponse =
      await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: finalPrompt

      });


    return {

      answer:
        finalResponse.text || "",

      sources: []

    };


  } catch (error) {

    console.error(
      "\n========== AGENT ERROR =========="
    );

    console.error(error);


    if (
      error?.status === 429 ||
      error?.code === 429
    ) {

      throw new Error(
        "Gemini API quota exceeded. Please try again later."
      );

    }


    throw error;

  }

}


module.exports = {
  runAgent
};
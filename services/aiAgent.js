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

const {
  askRAG
} = require("./ragService");


// =====================================================
// CONFIG
// =====================================================

const MODEL = "gemini-3.6-flash";

const MAX_AGENT_STEPS = 10;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;


// =====================================================
// GEMINI REST URL
// =====================================================

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;


// =====================================================
// VALIDATION
// =====================================================

function validateConfig() {

  if (!GEMINI_API_KEY) {

    throw new Error(
      "GEMINI_API_KEY is missing from .env"
    );

  }

}


// =====================================================
// TOOL DECLARATIONS
// =====================================================

const tools = [
  {
    functionDeclarations: [

      // =================================================
      // GET ALL PRODUCTS
      // =================================================

      {
        name: "getAllProducts",

        description:
          "Get all actual products stored in MongoDB.",

        parameters: {
          type: "OBJECT",

          properties: {}
        }
      },


      // =================================================
      // SEARCH PRODUCTS
      // =================================================

      {
        name: "searchProducts",

        description:
          "Search actual MongoDB products by product name or keyword.",

        parameters: {

          type: "OBJECT",

          properties: {

            search: {

              type: "STRING",

              description:
                "Product name or keyword to search."

            }

          },

          required: [
            "search"
          ]

        }

      },


      // =================================================
      // CHEAPEST
      // =================================================

      {
        name: "getCheapestProduct",

        description:
          "Find the actual product with the lowest price in MongoDB.",

        parameters: {

          type: "OBJECT",

          properties: {}

        }

      },


      // =================================================
      // MOST EXPENSIVE
      // =================================================

      {
        name: "getMostExpensiveProduct",

        description:
          "Find the actual product with the highest price in MongoDB.",

        parameters: {

          type: "OBJECT",

          properties: {}

        }

      },


      // =================================================
      // COUNT
      // =================================================

      {
        name: "getProductCount",

        description:
          "Get the total number of products stored in MongoDB.",

        parameters: {

          type: "OBJECT",

          properties: {}

        }

      },


      // =================================================
      // CREATE
      // =================================================

      {
        name: "createProduct",

        description: `
Create a new product in MongoDB.

Only call this when the user explicitly
asks to create or add a product.
`,

        parameters: {

          type: "OBJECT",

          properties: {

            name: {

              type: "STRING",

              description:
                "Product name."

            },

            price: {

              type: "NUMBER",

              description:
                "Product price."

            },

            quantity: {

              type: "NUMBER",

              description:
                "Product quantity."

            }

          },

          required: [
            "name",
            "price",
            "quantity"
          ]

        }

      },


      // =================================================
      // UPDATE
      // =================================================

      {
        name: "updateProduct",

        description: `
Update an existing product in MongoDB.

Only call this when the user explicitly
asks to update a product.
`,

        parameters: {

          type: "OBJECT",

          properties: {

            name: {

              type: "STRING",

              description:
                "Existing product name."

            },

            price: {

              type: "NUMBER",

              description:
                "New product price."

            },

            quantity: {

              type: "NUMBER",

              description:
                "New product quantity."

            }

          },

          required: [
            "name",
            "price",
            "quantity"
          ]

        }

      },


      // =================================================
      // DELETE
      // =================================================

      {
        name: "deleteProduct",

        description: `
Delete an existing product from MongoDB.

This is a destructive operation.

Only call this when the user explicitly
asks to delete a product.
`,

        parameters: {

          type: "OBJECT",

          properties: {

            name: {

              type: "STRING",

              description:
                "Product name to delete."

            }

          },

          required: [
            "name"
          ]

        }

      },


      // =================================================
      // RAG
      // =================================================

      {
        name: "searchKnowledgeBase",

        description: `
Search the company's knowledge base.

Use this for company-specific information:

- company name
- company history
- founder
- location
- services
- mission
- return policy
- business policies

Never invent company-specific information.
`,

        parameters: {

          type: "OBJECT",

          properties: {

            query: {

              type: "STRING",

              description:
                "Question to search in the knowledge base."

            }

          },

          required: [
            "query"
          ]

        }

      }

    ]
  }
];


// =====================================================
// SYSTEM INSTRUCTION
// =====================================================

const SYSTEM_INSTRUCTION = `

You are an autonomous Agentic AI assistant.

You have access to:

1. MongoDB product tools.
2. Company knowledge-base RAG.
3. General knowledge.

=====================================================
PRODUCT DATA
=====================================================

Product information MUST come from MongoDB.

Never invent product information.

For product questions use the appropriate tool.

Examples:

"What is the cheapest product?"
Use getCheapestProduct.

"What is the most expensive product?"
Use getMostExpensiveProduct.

"How many products are there?"
Use getProductCount.

"Show all products."
Use getAllProducts.

"Find laptop."
Use searchProducts.

"What is the price of iPhone?"
Use searchProducts.

"Search mobile."
Use searchProducts.


=====================================================
CREATE
=====================================================

Only create products when the user explicitly
asks to create/add a product.

Example:

"Create iPhone price 80000 quantity 5"

Use createProduct.


=====================================================
UPDATE
=====================================================

Only update products when explicitly requested.

Example:

"Update laptop price to 50000 quantity 10"

Use updateProduct.


=====================================================
DELETE
=====================================================

Only delete products when explicitly requested.

Example:

"Delete iPhone"

Use deleteProduct.


=====================================================
COMPANY KNOWLEDGE
=====================================================

For company-specific questions use:

searchKnowledgeBase.

Examples:

"What is the company name?"

"Who is the founder?"

"Where is the company located?"

"What services do you provide?"

"What is the return policy?"


=====================================================
GENERAL QUESTIONS
=====================================================

For general questions such as:

"What is Node.js?"

"What is Angular?"

"What is MongoDB?"

"What is Express?"

"What is REST API?"

"What is Agentic AI?"

answer using your general knowledge.

Do not use product tools for general questions.

Do not use the company knowledge base for
general questions.


=====================================================
MULTI-STEP AGENTIC REASONING
=====================================================

You may call multiple tools.

Example:

"Find the cheapest laptop and tell me
the return policy."

You should:

1. Search for laptop products.
2. Inspect the returned products.
3. Determine the cheapest laptop.
4. Search the knowledge base.
5. Combine the results.
6. Give one final answer.


=====================================================
IMPORTANT
=====================================================

Never invent database information.

Never invent company information.

Always inspect tool results.

If no product exists, say that it was not found.

If the knowledge base does not contain the
information, say so.

Do not expose internal tool names.

Do not expose implementation details.

Give a natural final response.

`;


// =====================================================
// EXECUTE TOOL
// =====================================================

async function executeTool(name, args) {

  console.log("\n================================");
  console.log("EXECUTING TOOL");
  console.log("TOOL:", name);
  console.log("ARGS:", args);
  console.log("================================");


  switch (name) {

    // =================================================
    // PRODUCTS
    // =================================================

    case "getAllProducts":

      return await getAllProducts();


    case "searchProducts":

      return await searchProducts(
        args?.search
      );


    case "getCheapestProduct":

      return await getCheapestProduct();


    case "getMostExpensiveProduct":

      return await getMostExpensiveProduct();


    case "getProductCount":

      return await getProductCount();


    // =================================================
    // CREATE
    // =================================================

    case "createProduct":

      return await createProduct(
        args?.name,
        args?.price,
        args?.quantity
      );


    // =================================================
    // UPDATE
    // =================================================

    case "updateProduct":

      return await updateProduct(
        args?.name,
        args?.price,
        args?.quantity
      );


    // =================================================
    // DELETE
    // =================================================

    case "deleteProduct":

      return await deleteProduct(
        args?.name
      );


    // =================================================
    // RAG
    // =================================================

    case "searchKnowledgeBase":

      return await askRAG(
        args?.query
      );


    // =================================================
    // UNKNOWN
    // =================================================

    default:

      throw new Error(
        `Unknown tool: ${name}`
      );

  }

}


// =====================================================
// CALL GEMINI REST API
// =====================================================

async function callGemini(contents) {

  const requestBody = {

    systemInstruction: {

      parts: [

        {
          text:
            SYSTEM_INSTRUCTION
        }

      ]

    },

    contents,

    tools,

    generationConfig: {

      temperature: 0.2

    }

  };


  console.log(
    "\nSending request to Gemini..."
  );


  const response =
    await fetch(
      GEMINI_URL,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify(
            requestBody
          )

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      "Gemini API ERROR:",
      JSON.stringify(
        data,
        null,
        2
      )
    );


    const error =
      new Error(
        data?.error?.message ||
        `Gemini API error: ${response.status}`
      );


    error.status =
      response.status;


    throw error;

  }


  return data;

}


// =====================================================
// GET MODEL CONTENT
// =====================================================

function getModelContent(data) {

  return (
    data
      ?.candidates
      ?.[0]
      ?.content
  );

}


// =====================================================
// GET FUNCTION CALLS
// =====================================================

function getFunctionCallParts(content) {

  if (
    !content ||
    !Array.isArray(content.parts)
  ) {

    return [];

  }


  return content.parts.filter(
    part =>
      part &&
      part.functionCall
  );

}


// =====================================================
// RUN AGENT
// =====================================================

async function runAgent(message) {

  console.log(
    "\n=========================================="
  );

  console.log(
    "          GEMINI AGENT STARTED"
  );

  console.log(
    "=========================================="
  );

  console.log(
    "MODEL:",
    MODEL
  );

  console.log(
    "USER:",
    message
  );


  // ===================================================
  // VALIDATION
  // ===================================================

  validateConfig();


  if (
    !message ||
    typeof message !== "string" ||
    !message.trim()
  ) {

    throw new Error(
      "Message is required."
    );

  }


  // ===================================================
  // CONVERSATION HISTORY
  // ===================================================
  //
  // VERY IMPORTANT:
  //
  // We keep the COMPLETE model response.
  //
  // This means:
  //
  // functionCall
  // +
  // thoughtSignature
  //
  // are preserved.
  //
  // NEVER reconstruct the model functionCall.
  //
  // ===================================================

  const contents = [

    {

      role: "user",

      parts: [

        {
          text:
            message
        }

      ]

    }

  ];


  // ===================================================
  // TRACKING
  // ===================================================

  const toolCalls = [];

  const sources = [];


  // ===================================================
  // AGENT LOOP
  // ===================================================

  for (
    let step = 1;
    step <= MAX_AGENT_STEPS;
    step++
  ) {

    console.log(
      `\n========== AGENT STEP ${step} ==========`
    );


    // =================================================
    // CALL GEMINI
    // =================================================

    const data =
      await callGemini(
        contents
      );


    // =================================================
    // MODEL CONTENT
    // =================================================

    const modelContent =
      getModelContent(
        data
      );


    if (!modelContent) {

      throw new Error(
        "Gemini returned no model content."
      );

    }


    // =================================================
    // FUNCTION CALLS
    // =================================================

    const functionCallParts =
      getFunctionCallParts(
        modelContent
      );


    console.log(
      "FUNCTION CALL COUNT:",
      functionCallParts.length
    );


    // =================================================
    // NO FUNCTION CALL
    // =================================================

    if (
      functionCallParts.length === 0
    ) {

      let answer = "";


      if (
        Array.isArray(
          modelContent.parts
        )
      ) {

        answer =
          modelContent.parts
            .filter(
              part =>
                typeof part.text === "string"
            )
            .map(
              part =>
                part.text
            )
            .join("\n");

      }


      console.log(
        "\n=========================================="
      );

      console.log(
        "             AGENT FINISHED"
      );

      console.log(
        "=========================================="
      );

      console.log(
        "ANSWER:",
        answer
      );


      return {

        success:
          true,

        answer:
          answer,

        sources:
          sources,

        toolCalls:
          toolCalls

      };

    }


    // =================================================
    // CRITICAL
    // =================================================
    //
    // Push the COMPLETE model content.
    //
    // DO NOT DO:
    //
    // {
    //   role: "model",
    //   parts: [
    //      {
    //        functionCall: ...
    //      }
    //   ]
    // }
    //
    // because that can remove the thoughtSignature.
    //
    // Gemini 3 requires the thought signature from
    // the function-call part to be returned.
    //
    // =================================================

    contents.push(
      modelContent
    );


    // =================================================
    // FUNCTION RESPONSES
    // =================================================

    const functionResponseParts = [];

    for (const part of functionCallParts) {

      const functionCall = part.functionCall;
      const name = functionCall.name;
      const args = functionCall.args || {};


      console.log("\n--------------------------------");
      console.log("TOOL SELECTED:", name);
      console.log("ARGUMENTS:",args);
      let result;
      let success = true;

      try {

        result =
          await executeTool(
            name,
            args
          );


      } catch (error) {

        success = false;

        console.error("TOOL ERROR:", error);

        result = {
          success:false,
          error: error.message
        };

      }

      toolCalls.push({
        name: name,
        arguments: args,
        success: success

      });


      // =================================================
      // SOURCES
      // =================================================

      if (
        name === "searchKnowledgeBase"
      ) {

        if (
          result && Array.isArray(result.sources)
        ) {

          sources.push(...result.sources);

        }

      }


      // =================================================
      // FUNCTION RESPONSE
      // =================================================
      //
      // IMPORTANT:
      //
      // Gemini REST expects:
      //
      // {
      //   functionResponse: {
      //     name: "...",
      //     response: {
      //       output: ...
      //     }
      //   }
      // }
      //
      // NOT:
      //
      // response: [...]
      //
      // =================================================

      function safeJson(value) {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return {
          success: false,
          error: "Tool returned a non-serializable result."
        };
      }
    }


      functionResponseParts.push({
        functionResponse: {
          name: name,
          response: {
           output: safeJson(result)

          }

        }

      });

    }


    // =================================================
    // ADD FUNCTION RESPONSE
    // =================================================

    contents.push({

      role: "user",

      parts:
        functionResponseParts

    });


    console.log(
      "FUNCTION RESPONSES ADDED TO HISTORY."
    );

  }


  return {

    success:
      false,

    answer:
      "I could not complete the request within the maximum number of agent steps.",

    sources:
      sources,

    toolCalls:
      toolCalls

  };

}


module.exports = {
  runAgent
};

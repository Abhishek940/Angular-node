// services/aiAgent.js

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


async function runAgent(message) {

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
    // TOOL DEFINITIONS
    // =====================================================

    const tools = [
      {
        functionDeclarations: [

          {
            name: "getAllProducts",

            description:
              "Get all products from MongoDB.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "searchProducts",

            description:
              "Search MongoDB products by name or keyword.",

            parameters: {
              type: Type.OBJECT,

              properties: {

                search: {
                  type: Type.STRING,
                  description:
                    "Product name or search keyword."
                }

              },

              required: ["search"]
            }
          },


          {
            name: "getCheapestProduct",

            description:
              "Find the product with the lowest price.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "getMostExpensiveProduct",

            description:
              "Find the product with the highest price.",

            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          },


          {
            name: "getProductCount",

            description:
              "Get the total number of products.",

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
              "Update an existing product.",

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
              "Delete an existing product.",

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
    // AGENT INSTRUCTION
    // =====================================================

const systemInstruction = `

You are an intelligent agent for a Product Management application.
Technology:
Angular
Node.js
Express
MongoDB
You have access to MongoDB product tools.
When the user asks about actual products,
use the appropriate database tool.

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

"Create iPhone price 80000 quantity 5"
-> createProduct

"Update laptop price to 50000 quantity 10"
-> updateProduct

"Delete iPhone"
-> deleteProduct

Never invent database information.

For general questions such as:

Angular
Node.js
MongoDB
JavaScript
TypeScript
Express
programming
Agentic AI

answer normally.

`;


    // =====================================================
    // FIRST GEMINI CALL
    // =====================================================

    const response =
      await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: message,

        config: {

          systemInstruction,

          tools

        }

      });


    console.log("Gemini initial response received" );


    // =====================================================
    // CHECK TOOL CALL
    // =====================================================

    const functionCalls =
      response.functionCalls || [];

    if (functionCalls.length === 0) {
      console.log("GENERAL QUESTION - GEMINI ANSWER");
      return response.text || "";

    }


    // =====================================================
    // EXECUTE TOOL
    // =====================================================

    const results = [];
    for (const call of functionCalls) {
     console.log( "================================" );
     console.log("Agent selected Tool:", call.name );
      console.log( "ARGUMENTS:", call.args );

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
              `Unknown tool ${call.name}`
          };

      }


      console.log("dbResult:", result);
      results.push({tool: call.name, result });

    }


    // =====================================================
    // SECOND GEMINI CALL
    // =====================================================
 const finalPrompt = `
 User question:
${message}

The following database tool was executed by the agent:

${JSON.stringify(results, null, 2)}


Now answer the user's question.

Rules:

- Use the database result above.
- Do not invent product information.
- Be clear and concise.
- If a product was found, mention its name,
  price and quantity when available.
- Do not mention internal tool names.
`;


    const finalResponse =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: finalPrompt
      });

    return finalResponse.text || "";

  } catch (error) {
    console.error( "========== AGENT ERROR ==========");

   if (error?.status === 429 || error?.code === 429 ) {

      throw new Error("Gemini API quota exceeded. Please try again later." );

    }


    throw error;

  }

}


module.exports = {
  runAgent
};
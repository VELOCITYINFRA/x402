"use client";/**
 /**
 * Fetches data from a Velocity endpoint.
 *
 * @param {object} params - The parameters for the fetch operation.
 * @param {any} params.x402client - x402-solana client instance (Original: x402client)
 * @param {string} params.dev_address - wallet address (Original: dev_address)
 * @param {string} params.tag - endpoint tag or x402id (Original: tag)
 * @param {"GET"|"POST"} params.method - HTTP method (Original: method)
 * @param {object} [params.body] - POST body payload (Original: body)
 */



function buildVelocityURL_FOR_GET(tag) {
  return `https://xvelocity.dev/api/${tag}`;
  
}

function buildVelocityURL_FOR_POST() {
  return `https://xvelocity.dev/api/postv`;
}


function buildHeaders(walletAddress) {
  return {
    "x-wallet": walletAddress,
    "content-type": "application/json"
  };
}


function buildHeadersForPOST(walletAddress,tag) {

  return {
    "x-wallet": walletAddress,
    "x402id":tag,
    "content-type": "application/json"
  };
}


/**
 * Validates the configuration object.
 * @private
 */
function validateConfig({ x402client, dev_address, tag, method }) {
  if (!x402client) {
    throw new Error("x402client is required");
  }
  if (!dev_address || typeof dev_address !== "string") {
    throw new Error("dev_address must be a valid string");
  }
  if (!tag || typeof tag !== "string") {
    throw new Error("tag must be a valid string");
  }
  if (!["GET", "POST"].includes(method)) {
    throw new Error("method must be either GET or POST");
  }
}



export default  async function FetchVelocity(config) {

  
   const {
    x402client,
    dev_address,
    tag,
    method,
    body,

   }=config


   validateConfig(config);

   try {



    const url = method === "GET" 
    ? buildVelocityURL_FOR_GET(tag)
    : buildVelocityURL_FOR_POST(tag);
    if (method=="GET") {

            return  await x402client.fetch(url, {
                    method: 'GET',
                    mode:"cors",
                    headers:buildHeaders(dev_address)

            });

        
         
        }

    else if (method=="POST"){

            return await x402client.fetch(BASEURL_FOR_POST, {
                method:'POST',
                mode:"cors",
                body:JSON.stringify(body),
                headers:buildHeadersForPOST(dev_address,tag)

            });


    }

    throw new Error("Invalid method: must be GET or POST");
   }catch(error){
    console.error("Velocity error:", error);
    throw error;

   }

}
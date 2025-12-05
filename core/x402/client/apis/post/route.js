import { provideClient } from "@/app/utils/mongodb";
import toUsdcUnits from "../../utils/usdcconverter";
import {updateInvoice} from "../../utils/updateinvoice";
import {X402Proxy_POST} from "../../utils/proxies"


const mc = provideClient();
const db = mc.db("x402ify_db");
const coll = db.collection("x402ify_col");



import { NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';


export async function POST(req) {


   
   
    const wallet=req.headers.get("x-wallet")
    const id = request.headers.get("x402id")


    const document=await coll.findOne({ "owner": wallet });


    let found_endpoint=null
    let found_price=null

    if (id.includes("x402")) {
    
      const endpoints = document.endpoints;
    
      const found = endpoints.find(endpoint => 
        endpoint.endpoint_linker ===id
      );

      if (found) {
        found_endpoint = found.endpoint;
        found_price = found.price;
    }

  } else {
    
    const dynamicendpoints = document.dynamicendpoints;
    
    const found = dynamicendpoints.find(dendpoint => 
        dendpoint.endpoint_linker ===id
    );

    if (found) {
        found_endpoint = found.endpoint;
        found_price = found.price;
    }
}



  const maxAmountRequired=toUsdcUnits(found_price)
  const to_wallet=wallet


  const x402 = new X402PaymentHandler({
      network: 'solana',
      treasuryAddress: to_wallet,
      facilitatorUrl: 'https://facilitator.payai.network',
  });

  // 1. Extract payment header


  const headers = new Headers(req.headers);
  headers.delete('x-wallet');

  const paymentHeader = x402.extractPayment(headers);
  
  // 2. Create payment requirements using x402 RouteConfig format
  const paymentRequirements = await x402.createPaymentRequirements({
    price: {
      amount: maxAmountRequired,
      asset: {
        address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      }
    },
    network: 'solana',
    config: {
      description: 'velocity registered endpoint request',
      resource: `http://localhost:3000/api/postv`,
    }
  });
  
  if (!paymentHeader) {
    // Return 402 with payment requirements
    const response = x402.create402Response(paymentRequirements);
    return NextResponse.json(response.body, { status: response.status });
  }

  // 3. Verify payment
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
  }

  // 4. Process your business logic
 
  
  await updateInvoice(wallet,id,data)

  const proxy_response=await X402Proxy_POST(req,found_endpoint)

  const result=proxy_response.content

  // 5. Settle payment
  await x402.settlePayment(paymentHeader, paymentRequirements);

  // 6. Return response
  return NextResponse.json(result);
}

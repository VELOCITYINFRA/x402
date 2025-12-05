# Velocity X402 Wrapper

A lightweight async wrapper for velocity around `x402-solana` that makes it dead simple to call your Velocity endpoints using X402-secured fetches on Solana.

## 📦 Installation

Using npm:

```bash
npm install velocitysdk
```
sample usage:

```js
import FetchVelocity from "velocitysdk";
import { createX402Client } from "x402-solana";
import { useWallet } from "@solana/wallet-adapter-react";
export default function Velocity(){

    const { publicKey, signTransaction, connected } = useWallet();

    const wallet = {
        publicKey,
        signTransaction,
        address: publicKey.toBase58(),
    }

    const client = createX402Client({
      wallet,
      network: 'network here',  //solana
      maxPaymentAmount: BigInt(1_000_000), //exact amount as registered price but in lamports
    });


      let fetchvelocityconfig_post={

            x402client:client,
            dev_address:"address of the wallet that registered the endpoint",
            tag:"endpoint tag",
            method:"POST", //here post endpoint is used 
            body:{"key1":"value1"}

        }

    const result = await FetchVelocity(fetchvelocityconfig_post);
    const response=await result.json();
    console.log(response);
    
    
    let fetchvelocityconfig_get={

            x402client:client,
            dev_address:"address of the wallet that registered the endpoint",
            tag:"endpoint tag",
            method:"GET", //here get endpoint is used 
            body:{} //empty body

        }

    const result = await FetchVelocity(fetchvelocityconfig_get);
    const response=await result.json();
    console.log(response);



}


```

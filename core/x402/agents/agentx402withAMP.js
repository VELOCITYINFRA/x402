import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import { 
    getAssociatedTokenAddress, 
    createTransferInstruction 
} from '@solana/spl-token';

import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(),'.agent_cache');
const CACHE_FILE = path.join(CACHE_DIR, 'agentmanifest.json');
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

async function createwallet() {
    const filePath = 'agent-wallet.json';
    
    if(!fs.existsSync(filePath)) {
        let kp = Keypair.generate()
        let publickey = kp.publicKey.toBase58()
        let secretkey = Array.from(kp.secretKey) // Convert to array for JSON
        let jsonString = JSON.stringify({
           "public_key": publickey,
           "secret_key": secretkey
        })
        fs.writeFileSync(filePath, jsonString, 'utf8');
        return {"data": {"public_key": publickey, "secret_key": secretkey}}
    }
    else {
        const cachedData = fs.readFileSync(filePath, 'utf8');
        const walletdata = JSON.parse(cachedData);
        return {"data": walletdata}
    }
}

function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log(`Created cache directory: ${CACHE_DIR}`);
    }
}

async function getPaymentRequirements(){
    ensureCacheDir()
    
    if (fs.existsSync(CACHE_FILE)) {
        try {
            const cachedData = fs.readFileSync(CACHE_FILE, 'utf8');
            const manifest = JSON.parse(cachedData);
            console.log('Serving from permanent local file cache.');
            return manifest;
        } catch (error) {
            console.warn('Error reading or parsing cached file. Attempting to fetch new data.', error);
        }
    }

    const url = "ENDPOINTURL/.well-known/agentmanifest.json"
    const request = await fetch(url, {
        method: "GET",
        mode: "cors"
    })
    const response = await request.json()
    console.log(response)
    const jsonString = JSON.stringify(response, null, 2);
    fs.writeFileSync(CACHE_FILE, jsonString, 'utf8');
    console.log(`Manifest cached permanently at: ${CACHE_FILE}`);
    return response
}

function constructPaymentHeader(manifest,serializedTransaction){
    const paymentPayload = {
        x402Version: manifest.x402Version,
        scheme: manifest.scheme,
        network: manifest.network,
        payload: {
            transaction: serializedTransaction,
        },
    };

    const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
    return paymentHeader;
}

async function MakePaidRequest(){
    let wallet = await createwallet()
    let pr = await getPaymentRequirements()
    
   
    let endpoint = pr.endpoints[0]
    let accepts = endpoint.paymentRequirements.accepts[0]
    
 
    const agentKeypair = Keypair.fromSecretKey(new Uint8Array(wallet.data.secret_key));
    const recipientPubKey = new PublicKey(accepts.payTo);
    const mintPubKey = new PublicKey(accepts.asset); 
    
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    
    const senderTokenAccount = await getAssociatedTokenAddress(mintPubKey, agentKeypair.publicKey);
    const recipientTokenAccount = await getAssociatedTokenAddress(mintPubKey, recipientPubKey);
    
    
    const transaction = new Transaction({
        feePayer: new PublicKey(accepts.extra.feePayer),
        recentBlockhash: blockhash
    });
    
 
    transaction.add(
        createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            agentKeypair.publicKey,
            BigInt(accepts.maxAmountRequired)
        )
    );
    
    transaction.sign(agentKeypair);
    const serializedTransaction = transaction.serialize().toString('base64');
  
    let pHeader = constructPaymentHeader(pr, serializedTransaction)

    const request = await fetch(endpoint.endpoint, {
        method: endpoint.method,
        mode: "cors",
        headers: {
            "X-PAYMENT": pHeader
        }
    })
    const response = await request.json()
    console.log(response)
    return response
}

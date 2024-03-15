import express from 'express';
import path from 'path';
import {convertToTypeBytes16, loadAndValidateEnvVariablesInProcess} from './utils';
import {ethers} from 'ethers';
import {abi} from './abi';
import bodyParser from 'body-parser';
import {encryptContent, importPublicKey} from './keys-utils';

const port = 3001;
const app = express();
app.use(bodyParser.json());
app.disable('etag');
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.post('/access', function (req, res) {
    let gateUUID = req.body.gateUUID;
    let mnemonic = req.body.mnemonic;
    let nonce = req.body.nonce;

    run(gateUUID, mnemonic, nonce).then(address => {
        res.send({
            gateUUID: gateUUID,
            carAddress: address,
            nonce: nonce
        });
    }).catch(reason => {
        console.error("gateUUID: " + gateUUID + " nonce: " + nonce, reason)
    })

})
app.listen(port, () => {
    console.log("server started on " + port);
})

async function run(gateUUID: string, mn: string, nonce: string): Promise<string> {

    loadAndValidateEnvVariablesInProcess(['CONTRACT_ADDRESS', 'NODE_URL', 'MNEMONIC', 'GATE_PUBLIC_KEY'])

    let nodeUrl = process.env.NODE_URL as string;
    let contractAddress = process.env.CONTRACT_ADDRESS as string;
    let mnemonicString = mn || process.env.MNEMONIC as string;
    let gatePublicKey = process.env.GATE_PUBLIC_KEY as string;

    const mnemonic = ethers.Mnemonic.fromPhrase(mnemonicString);
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);
    let address = wallet.address;

    const provider = new ethers.JsonRpcProvider(nodeUrl, {
        name: "Testnet EVM",
        chainId: 1073
    });
    let walletWithProvider = wallet. connect(provider);

    let contract = new ethers.Contract(contractAddress, abi, walletWithProvider);

    let gateUUIDNormalized = convertToTypeBytes16(gateUUID);
    let requestedAt = new Date().toISOString();
    const message = {"requestedAt": requestedAt, "carAddress": address, "nonce": nonce};
    let messageString = JSON.stringify(message);

    let publicKey = await importPublicKey(gatePublicKey);
    const encryptedMessageInBase64 = await encryptContent(publicKey, messageString);
    let result = await contract.requestAccess(gateUUIDNormalized, encryptedMessageInBase64);
    console.log(requestedAt + " transaction nonce: " + nonce + " hash: " + result?.hash + " original: " + messageString);
    return address;
}

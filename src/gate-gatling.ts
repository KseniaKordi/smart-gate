import {loadAndValidateEnvVariablesInProcess} from './utils';
import {abi} from './abi';
import {ethers} from 'ethers';
import {loadPKCS8PrivateKeyFromFile} from './keys-utils';
import express from 'express';
import {GatlingCommandFetcher} from './GatlingCommandFetcher';

async function run() {

    loadAndValidateEnvVariablesInProcess(['CONTRACT_ADDRESS', 'NODE_URL', 'GATE_UUID']);

    let nodeUrl = process.env.NODE_URL as string;
    let contractAddress = process.env.CONTRACT_ADDRESS as string;
    let gateUUID = process.env.GATE_UUID as string;

    const provider = new ethers.JsonRpcProvider(nodeUrl, {
        name: "Testnet EVM",
        chainId: 1073
    });

    let privateKey: CryptoKey = await loadPKCS8PrivateKeyFromFile('./certs/pkcs8.key');

    let contract = new ethers.Contract(contractAddress, abi, provider);

    let commandFetcher = new GatlingCommandFetcher(gateUUID, privateKey, contract);

    const port = 3002;
    const app = express();
    app.disable('etag');
    app.get('/nonce/:nonce', function (req, res) {
        let nonce = req.params.nonce;
        let found = commandFetcher.isEventReceived(nonce);
        let result = {nonce, found};
        console.log(new Date().toISOString() + " polling", result);
        res.send(result);
    })
    app.listen(port, () => {
        console.log("server started for measurements on " + port);
    })

    await commandFetcher.startListening((accessGranted, content) => {
        console.log(`${new Date().toISOString()} car ${content.carAddress} asks access for gate ${gateUUID} access granted ${accessGranted}`);
    }, reason => {
        console.error(reason);
    })
}

run()
    .then(() => process.exit())
    .catch(reason => {
        console.log(reason);
        process.exit(1)
    });



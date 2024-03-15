import {CommandFetcher} from './CommandFetcher';
import {loadAndValidateEnvVariablesInProcess} from './utils';
import {abi} from './abi';
import {ethers} from 'ethers';
import {loadPKCS8PrivateKeyFromFile} from './keys-utils';

async function run() {

    loadAndValidateEnvVariablesInProcess(['CONTRACT_ADDRESS', 'NODE_URL', 'GATE_UUID']);

    let nodeUrl = process.env.NODE_URL as string;
    let contractAddress = process.env.CONTRACT_ADDRESS as string;
    let gateUUID = process.env.GATE_UUID as string
    const provider = new ethers.JsonRpcProvider(nodeUrl, {
        name: "Testnet EVM",
        chainId: 1073
    });

    let privateKey: CryptoKey = await loadPKCS8PrivateKeyFromFile('./certs/pkcs8.key');

    let contract = new ethers.Contract(contractAddress, abi, provider);

    let commandFetcher = new CommandFetcher(gateUUID, privateKey, contract);

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

import {ethers} from 'ethers';
import {callWithTimeout, convertToTypeBytes16, loadAndValidateEnvVariablesInProcess} from './utils';
import {createInterface, Interface} from 'node:readline';
import {abi} from './abi';


const getGateUUID = (readline: Interface) => {
    return new Promise<string>((resolve, reject) => {
        readline.question('Type gate UUID and press Enter: ', (answer) => {
            resolve(answer)
        })
    })
}

const getCarAddress = (readline: Interface) => {
    return new Promise<string>((resolve, reject) => {
        readline.question('Type car address: ', (answer) => {
            resolve(answer)
        })
    })
}

const addAnotherCarAddress = (readline: Interface) => {
    return new Promise<boolean>((resolve, reject) => {

        readline.question(`Do you want to add another car address to the gate? Y/n: `, (answer) => {
            if (answer == 'Y') {
                resolve(true);
            } else if (answer == 'n') {
                resolve(false);
            } else {
                reject(new Error("unrecognized input"));
            }
        })
    })
}


async function run() {

    loadAndValidateEnvVariablesInProcess(['CONTRACT_ADDRESS', 'NODE_URL', 'ADMIN_MNEMONIC']);

    let nodeUrl = process.env.NODE_URL as string;
    let contractAddress = process.env.CONTRACT_ADDRESS as string;
    let mnemonicString = process.env.ADMIN_MNEMONIC as string;

    const mnemonic = ethers.Mnemonic.fromPhrase(mnemonicString);
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/0`);
    let address = wallet.address;

    const provider = new ethers.JsonRpcProvider(nodeUrl, {
        name: "Testnet EVM",
        chainId: 1073
    });
    let walletWithProvider = wallet.connect(provider);


    console.log("address", address);

    const readline = createInterface({
        input: process.stdin,
        output: process.stdout,
    });


    let nonce = await walletWithProvider.getNonce();
    let a: boolean;
    do {
        let gateUUID = convertToTypeBytes16(await getGateUUID(readline));
        let carAddress = await getCarAddress(readline);

        let contract = new ethers.Contract(contractAddress, abi, walletWithProvider);

        let result = await contract.grantAccess(gateUUID, carAddress, {nonce});
        console.log(result.hash, result.gasLimit);
        nonce++;

        a = await addAnotherCarAddress(readline);
        if (a) {
            nonce++;
        }
    } while (a)

    readline.close()
}

callWithTimeout(run, 100000000)
    .then(() => process.exit())
    .catch(reason => {
        console.log(reason);
        process.exit(1)
    });


import {config} from 'dotenv';

export function callWithTimeout(func: () => Promise<any>, timeout: number | undefined) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), timeout)
        func().then(response => resolve(response), err => reject(new Error(err)))
            .finally(() => clearTimeout(timer))
    })
}

export function wait(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}

export async function waitUntil(condition: () => boolean, time: number = 100) {
    while (!condition()) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }
}


export function convertToTypeBytes16(uuid: string) {
    let uuidWithoutHyphens = uuid.replace(/-/g, '').toLowerCase();
    return '0x' + uuidWithoutHyphens;
}

export function loadAndValidateEnvVariablesInProcess(requiredVariables: string[], path?: string) {
    config({path: path ?? '.env'});
    //check if environment variables are present in config file
    for (const envVar of requiredVariables) { //process.env.MY_VAR
        if (!(envVar in process.env)) {
            throw new Error(`environment variable ${envVar} is undefined, add it to .env file`);
        }
    }
}

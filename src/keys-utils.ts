import fs from 'fs';
import {PathOrFileDescriptor} from 'node:fs';
import crypto from 'crypto';

export async function loadPKCS8PrivateKeyFromFile(path: PathOrFileDescriptor): Promise<CryptoKey> {
    const privateKeyBuffer = fs.readFileSync(path);
    return await importPKCS8PrivateKey(privateKeyBuffer.toString(), ["decrypt"]);
}

async function importPKCS8PrivateKey(pkcs8: string, keyUsages: KeyUsage[]): Promise<CryptoKey> {
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    const pkcs8Contents = pkcs8.substring(header.length, pkcs8.length - footer.length - 1);
    const buffer = Buffer.from(pkcs8Contents, 'base64');
    return await crypto.webcrypto.subtle.importKey(
        "pkcs8",
        buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        keyUsages
    );
}

export async function decryptContent(privateKey: CryptoKey, base64Content: string): Promise<string> {
    const buffer = Buffer.from(base64Content, 'base64');
    let arrayBuffer = await crypto.webcrypto.subtle.decrypt(
        {name: "RSA-OAEP"},
        privateKey,
        buffer
    );
    return ab2str(arrayBuffer);
}

function ab2str(arrayBuffer: ArrayBuffer): string {
    let textDecoder = new TextDecoder("utf-8");
    return textDecoder.decode(arrayBuffer);
}

export async function importPublicKey(keyString: string): Promise<CryptoKey> {
    const header = "-----BEGIN PUBLIC KEY-----";
    const footer = "-----END PUBLIC KEY-----";
    const content = keyString.substring(
        header.length,
        keyString.length - footer.length - 1,
    );
    const buffer = Buffer.from(content, 'base64');
    return await crypto.webcrypto.subtle.importKey(
        "spki",
        buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"],
    );
}

export async function encryptContent(publicKey: CryptoKey, message: string): Promise<string> {
    let textEncoder = new TextEncoder();
    const byteArray: Uint8Array = textEncoder.encode(message);
    let arrayBuffer = await crypto.webcrypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        byteArray,
    );
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
}

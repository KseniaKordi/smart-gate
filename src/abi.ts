import {InterfaceAbi} from 'ethers/lib.commonjs/abi';

export const abi: InterfaceAbi =  [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes16",
                "name": "gateUUID",
                "type": "bytes16"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "carAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "accessGranted",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "content",
                "type": "string"
            }
        ],
        "name": "AccessAttempt",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes16",
                "name": "gateUUID",
                "type": "bytes16"
            },
            {
                "internalType": "address",
                "name": "carAddress",
                "type": "address"
            }
        ],
        "name": "denyAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes16",
                "name": "gateUUID",
                "type": "bytes16"
            },
            {
                "internalType": "address",
                "name": "carAddress",
                "type": "address"
            }
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes16",
                "name": "gateUUID",
                "type": "bytes16"
            },
            {
                "internalType": "string",
                "name": "content",
                "type": "string"
            }
        ],
        "name": "requestAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

### Connect to ShimmerEVM Testnet and deploy a Solidity Smart Contract

https://wiki.iota.org/tutorials/shimmerevm-testnet-setup/


### Create key pair

`openssl genrsa -out keypair.pem 2048`

### Extract public key

`openssl rsa -in keypair.pem -pubout -out publickey.crt`

### Extract private key

`openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in keypair.pem -out pkcs8.key`

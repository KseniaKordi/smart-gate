### The Smart Gate Barrier System Application consists of several programs.

Admin CLI - admin.ts

Driver Application - index.html served by car.ts locally at http://localhost:3001

Gate Application - gate.ts

## To start the communication process between the car and the gate, you need to do the following steps:

1. Run ‘Gate’
   
Using command 
`node --require ts-node/register src/gate.ts`

3. Start ‘Car’
   
Using command 
`node --require ts-node/register src/car.ts`

5. Open browser on the local host

6. Press the ‘connect’ button

7. A processed request with the decision to open the gate will appear in the ‘Gate’ terminal window.

## To add the new machine address to the database, you need to do the following steps:

1. Run ‘Admin’

Using command 
`node --require ts-node/register src/admin.ts`

2. Follow the instructions in the terminal window.


### Package
In the package file you can find the necessary scripts to run the programs.
For example, in order to start the gate you need to use ‘gate’ command, and in order to repeat the assessment of the system you need to use ‘gate-gatling’ command. 




### To create new keys, you need to do the following steps

1. Create key pair
   
Using command 
`openssl genrsa -out keypair.pem 2048`

3. Extract public key
   
Using command 
`openssl rsa -in keypair.pem -pubout -out publickey.crt`

5. Extract private key
   
Use command 
`openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in keypair.pem -out pkcs8.key`




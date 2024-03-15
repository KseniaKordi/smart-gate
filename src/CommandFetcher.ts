import {convertToTypeBytes16, wait} from './utils';
import {ethers} from 'ethers';
import {decryptContent} from './keys-utils';

export interface AccessAttemptContent {
    carAddress: string;
    requestedAt: Date;
    nonce: string;
}

export interface AccessAttemptEvent extends AccessAttemptContent {
    accessGranted: boolean;
}

export class CommandFetcher {
    private listening = false;
    private readonly contract: ethers.Contract;
    private readonly gateUUID: string;
    private readonly privateKey: CryptoKey;

    constructor(gateUUID: string, privateKey: CryptoKey, contract: ethers.Contract) {
        this.privateKey = privateKey;
        this.gateUUID = convertToTypeBytes16(gateUUID);
        this.contract = contract;
    }

    protected onEventDecrypted(event: AccessAttemptEvent) {

    }

    async startListening(onSuccess: (accessGranted: boolean, content: AccessAttemptContent) => void, onFailure: (reason: Error) => void) {
        this.listening = true;
        await this.contract.on("AccessAttempt", (gateUUID, carAddress, accessGranted, content, event) => {
            if (this.listening) {
                // console.log(event.log)
                if (gateUUID == this.gateUUID) {
                    decryptContent(this.privateKey, content)
                        .then(decryptedContent => {
                            let content = JSON.parse(decryptedContent) as AccessAttemptContent;
                            if (content.carAddress == carAddress) {
                                this.onEventDecrypted({
                                    carAddress: content.carAddress,
                                    nonce: content.nonce,
                                    requestedAt: content.requestedAt,
                                    accessGranted: accessGranted,
                                })
                                let allowedIntervalInMilliseconds = 60_000; //1 min
                                let nowInMillisecondsSinceTheEpoch = Date.now();

                                let accessRequestedAt = new Date(content.requestedAt);
                                let accessRequestedAtInMillisecondsSinceTheEpoch = accessRequestedAt.getTime();

                                let delta = nowInMillisecondsSinceTheEpoch - accessRequestedAtInMillisecondsSinceTheEpoch;
                                if (delta <= allowedIntervalInMilliseconds) {
                                    console.log(`${new Date().toISOString()} access request created at  ${accessRequestedAt.toISOString()} received at ${new Date(nowInMillisecondsSinceTheEpoch).toISOString()} took ${delta} milliseconds is within interval of ${allowedIntervalInMilliseconds} milliseconds`)
                                    onSuccess(accessGranted, content);
                                } else {
                                    onFailure(new Error(`old access request created at ${accessRequestedAt.toISOString()} received at ${new Date(nowInMillisecondsSinceTheEpoch).toISOString()} exceeds configured interval of ${allowedIntervalInMilliseconds} milliseconds`));
                                }
                            } else {
                                onFailure(new Error("car address mismatch"));
                            }
                        })
                        .catch(reason => {
                            onFailure(new Error(reason));
                        });
                }
            } else {
                event.removeListener();
            }
        });

        while (this.listening) {
            await wait(1000);
        }
    }

    async stopListening() {
        this.listening = false;
    }

}

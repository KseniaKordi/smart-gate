import bleno from '@abandonware/bleno';
import {loadAndValidateEnvVariablesInProcess} from './utils';

loadAndValidateEnvVariablesInProcess(['GATE_UUID', 'GATE_NAME', 'BEACON_SERVICE_UUID', 'GATE_PUBLIC_KEY']);

let gateUUID = process.env.GATE_UUID as string;
let gateName = process.env.GATE_NAME as string;
let gatePublicKey = process.env.GATE_PUBLIC_KEY as string;
let beaconServiceUuid = process.env.BEACON_SERVICE_UUID as string;

class CustomCharacteristic extends bleno.Characteristic {
    _value: Buffer;

    constructor() {
        super({
            uuid: gateUUID,
            properties: ['read'],
            value: Buffer.from(JSON.stringify({gateName, gatePublicKey}), 'utf-8')
        });
        this._value = Buffer.alloc(0); // Initial empty buffer
    }

    onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
        console.log('Read request received');
        callback(this.RESULT_SUCCESS, this._value);
    }
}

bleno.on('stateChange', state => {
    if (state === 'poweredOn') {
        bleno.startAdvertising(gateName, [beaconServiceUuid]);
        console.log('Start advertising gateName: ' + gateName + ' gateUUID: ' + gateUUID + ' with [' + beaconServiceUuid + ']');
    } else {
        console.log('Stopping...');
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', error => {
    if (!error) {
        console.log('Advertising started...');
        bleno.setServices([
            new bleno.PrimaryService({
                uuid: gateUUID,
                characteristics: [
                    new CustomCharacteristic()
                ]
            })
        ]);
    } else {
        console.log(`Advertising start error: ${error}`);
    }
});

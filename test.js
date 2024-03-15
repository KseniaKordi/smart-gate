"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callWithTimeout = void 0;
const node_events_1 = __importDefault(require("node:events"));
class CommandFetcher extends node_events_1.default {
    async fetchCommand(i) {
        try {
            const data = await new Promise((resolve, reject) => {
                let command = 'Command ' + i;
                resolve(command);
                // reject('error' + i);
            });
            console.log("commands sent", data);
            this.emit('commands', data);
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    async startFetchingCommands(n) {
        for (let i = 0; i < n; i++) {
            await wait(500);
            await this.fetchCommand(i);
        }
    }
}
function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}
function callWithTimeout(func, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), timeout);
        func().then(response => resolve(response), err => reject(new Error(err)))
            .finally(() => clearTimeout(timer));
    });
}
exports.callWithTimeout = callWithTimeout;
async function run() {
    let commandFetcher = new CommandFetcher();
    commandFetcher.on("commands", commandData => {
        console.log("commands received", commandData);
    });
    await commandFetcher.startFetchingCommands(5);
}
callWithTimeout(() => run(), 5000)
    .then(() => process.exit())
    .catch(reason => process.exit(1));

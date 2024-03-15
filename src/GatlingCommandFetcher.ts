import {AccessAttemptEvent, CommandFetcher} from './CommandFetcher';

export class GatlingCommandFetcher extends CommandFetcher {

    private readonly receivedEvents = new Map<string, AccessAttemptEvent>();

    isEventReceived(nonce: string): boolean {
        return this.receivedEvents.has(nonce);
    }

    protected onEventDecrypted(event: AccessAttemptEvent) {
        console.log(new Date().toISOString(), event);
        this.receivedEvents.set(event.nonce, event);
    }
}

import { OnStart } from "../../../Shared/Flamework";
export declare class ShutdownService implements OnStart {
    private playerConnected;
    private timeWithNoPlayers;
    private static shutdownTimeNobodyConnected;
    private static shutdownTimeAllPlayersLeft;
    constructor();
    OnStart(): void;
    Shutdown(): void;
}

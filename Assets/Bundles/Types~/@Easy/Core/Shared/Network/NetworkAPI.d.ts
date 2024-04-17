/// <reference types="compiler-types" />
import { Player } from "../Player/Player";
export declare enum NetworkChannel {
    Reliable = 0,
    Unreliable = 1
}
export declare function InitNet(): void;
declare function fireServer(id: number, args: unknown[], channel: NetworkChannel): void;
declare function fireAllClients(id: number, args: unknown[], channel: NetworkChannel): void;
declare function fireClient(id: number, player: Player, args: unknown[], channel: NetworkChannel): void;
declare function fireExcept(id: number, ignorePlayer: Player, args: unknown[], channel: NetworkChannel): void;
declare function fireClients(id: number, players: Player[], args: unknown[], channel: NetworkChannel): void;
declare function connect(asServer: boolean, id: number, callback: Callback): () => void;
declare const NetworkAPI: {
    fireServer: typeof fireServer;
    fireAllClients: typeof fireAllClients;
    fireClient: typeof fireClient;
    fireClients: typeof fireClients;
    fireExcept: typeof fireExcept;
    connect: typeof connect;
};
export default NetworkAPI;

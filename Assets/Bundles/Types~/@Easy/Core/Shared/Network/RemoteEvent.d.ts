/// <reference types="compiler-types" />
import { Player } from "../Player/Player";
import { NetworkChannel } from "./NetworkAPI";
type RemoteParamsToClient<T> = Parameters<T extends unknown[] ? (player: Player, ...args: T) => void : T extends unknown ? (player: Player, arg: T) => void : (player: Player) => void>;
type RemoteParamsToServer<T> = Parameters<T extends unknown[] ? (...args: T) => void : T extends unknown ? (arg: T) => void : () => void>;
type RemoteParamsToAllClients<T> = RemoteParamsToServer<T>;
type RemoteCallbackFromClient<T> = (...args: RemoteParamsToClient<T>) => void;
type RemoteCallbackFromServer<T> = (...args: RemoteParamsToServer<T>) => void;
declare class RemoteEventServer<T extends unknown[] | unknown> {
    private readonly id;
    private readonly channel;
    constructor(id: number, channel?: NetworkChannel);
    FireAllClients(...args: RemoteParamsToAllClients<T>): void;
    FireExcept(ignorePlayer: Player, ...args: RemoteParamsToAllClients<T>): void;
    FireClient(player: Player, ...args: RemoteParamsToAllClients<T>): void;
    FireClients(players: Player[], ...args: RemoteParamsToAllClients<T>): void;
    OnClientEvent(callback: RemoteCallbackFromClient<T>): () => void;
}
declare class RemoteEventClient<T extends unknown[] | unknown> {
    private readonly id;
    private readonly channel;
    constructor(id: number, channel?: NetworkChannel);
    FireServer(...args: RemoteParamsToServer<T>): void;
    OnServerEvent(callback: RemoteCallbackFromServer<T>): () => void;
}
export declare class RemoteEvent<T extends unknown[] | unknown> {
    readonly server: RemoteEventServer<T>;
    readonly client: RemoteEventClient<T>;
    /**
     *
     * @param channel
     * @param packageOffset Temporary workaround param.
     */
    constructor(channel: NetworkChannel | undefined, remoteIdentifier: string);
}
export {};

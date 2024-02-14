/// <reference types="@easy-games/compiler-types" />
import { Player } from "../Player/Player";
type RemoteParamsToServer<T> = Parameters<T extends unknown[] ? (...args: T) => void : T extends unknown ? (arg: T) => void : () => void>;
type RemoteFunctionReturn<RX> = RX extends [infer A] ? A : RX;
type RemoteFunctionCallback<TX, RX> = (player: Player, ...args: RemoteParamsToServer<TX>) => RemoteFunctionReturn<RX>;
declare class RemoteFunctionClient<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
    private readonly id;
    private listening;
    private sendId;
    private readonly yieldingThreads;
    constructor(id: number);
    FireServer(...args: RemoteParamsToServer<TX>): RemoteFunctionReturn<RX>;
    private StartListening;
}
declare class RemoteFunctionServer<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
    private readonly id;
    private disconnect;
    constructor(id: number);
    SetCallback(callback: RemoteFunctionCallback<TX, RX>): void;
}
export declare class RemoteFunction<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
    readonly server: RemoteFunctionServer<TX, RX>;
    readonly client: RemoteFunctionClient<TX, RX>;
    constructor();
}
export {};

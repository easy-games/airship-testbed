/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
export declare class TransferController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Submits a request to transfer to the provided game id. The client can optionally request to transfer
     * to a specific server of the given game by providing the perferred server id. It is possible that the
     * client will be transferred to a different server if the perferred server is full or was not allocated
     * with the default scene.
     * @param gameId Game id to join.
     * @param preferredServerId Specific ServerID to teleport to. If not included, the backend will select a server for you.
     */
    TransferToGameAsync(gameId: string, preferredServerId?: string): Promise<Result<undefined, undefined>>;
    /**
     * Submits a request to transfer to the current party leader. If the party leader is not in a game,
     * or the client is not in a party, this function will have no effect.
     */
    TransferToPartyLeader(): Promise<Result<undefined, undefined>>;
}

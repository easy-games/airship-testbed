/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { Player } from "../../../Shared/Player/Player";
import { Result } from "../../../Shared/Types/Result";
export type CreateServerResponse = {
    serverId: string;
};
export declare class TransferService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Creates a new server and returns a server id which can be used to transfer players to the new server.
     * @param sceneId The sceneId the server should start with. If not provided, the server will use the default
     * scene provided during deployment.
     * @returns The id of the new server. Undefined if the server was not able to be created.
     */
    CreateServer(sceneId?: string): Promise<Result<CreateServerResponse, undefined>>;
    /**
     * Transfers a player to the provided game. A server in the default scene will be selected, or a new one will be created.
     * @param player The player to transfer
     * @param gameId The gameId to transfer the player to
     * @param serverTransferData JSON encodable object that will be provided to the server being joined
     * @param clientTransferData JSON encodable object that will be provided to the client on transfer
     */
    TransferToGame(player: Player, gameId: string, serverTransferData?: unknown, clientTransferData?: unknown): Promise<Result<undefined, undefined>>;
    /**
     * Transfers a group of players to the provided game. A server in the default scene will be selected, or a new one will be created.
     * @param player The players to transfer
     * @param gameId The gameId to transfer the players to
     * @param serverTransferData JSON encodable object that will be provided to the server being joined
     * @param clientTransferData JSON encodable object that will be provided to the clients on transfer
     */
    TransferGroupToGame(players: readonly Player[], gameId: string, serverTransferData?: unknown, clientTransferData?: unknown): Promise<Result<undefined, undefined>>;
    /**
     * Transfers a player to the provided server. The server can be in any scene, but must be part of the current servers game.
     * @param player The player to transfer
     * @param serverId The server to transfer the player to
     * @param serverTransferData JSON encodable object that will be provided to the server being joined
     * @param clientTransferData JSON encodable object that will be provided to the client on transfer
     */
    TransferToServer(player: Player, serverId: string, serverTransferData?: unknown, clientTransferData?: unknown): Promise<Result<undefined, undefined>>;
    /**
     * Transfers a group of players to the provided server. The server can be in any scene, but must be part of the current servers game.
     * @param player The players to transfer
     * @param serverId The server to transfer the players to
     * @param serverTransferData JSON encodable object that will be provided to the server being joined
     * @param clientTransferData JSON encodable object that will be provided to the clients on transfer
     */
    TransferGroupToServer(players: readonly Player[], serverId: string, serverTransferData?: unknown, clientTransferData?: unknown): Promise<Result<undefined, undefined>>;
}

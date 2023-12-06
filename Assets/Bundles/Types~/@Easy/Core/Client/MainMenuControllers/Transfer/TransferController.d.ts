import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { SocketController } from "../Socket/SocketController";
export declare class TransferController implements OnStart {
    private readonly socketController;
    constructor(socketController: SocketController);
    OnStart(): void;
    /**
     * Sends a server transfer request to the backend.
     * @param gameId GameID of the desired server
     * @param serverId Specific ServerID to teleport to. If not included, the backend will select a server for you.
     */
    ClientTransferToServerAsync(gameId: string, serverId?: string): void;
}

import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { SocketController } from "../Socket/SocketController";
export declare class TransferController implements OnStart {
    private readonly socketController;
    constructor(socketController: SocketController);
    OnStart(): void;
    ClientTransferToServer(gameId: string, serverId?: string): void;
}

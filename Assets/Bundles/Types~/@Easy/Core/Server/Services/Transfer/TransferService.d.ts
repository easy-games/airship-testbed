import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Player } from "../../../Shared/Player/Player";
import { CreateServerResponse } from "./TransferServiceTypes";
export declare class TransferService implements OnStart {
    OnStart(): void;
    CreateServer(sceneId?: string): CreateServerResponse | undefined;
    TransferToGame(player: Player, gameId: string, serverTransferData?: unknown, clientTransferData?: unknown): void;
    TransferToServer(player: Player, serverId: string, serverTransferData?: unknown, clientTransferData?: unknown): void;
}
